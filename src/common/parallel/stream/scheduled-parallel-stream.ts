import { ITask } from "../../task/task";
import { IParallelTaskDefinition } from "../parallel-task-definition";
import { IParallelStream } from "./parallel-stream";
import { ParallelStream } from "./parallel-stream-impl";

/**
 * Stream that has been scheduled on the thread pool and waits for completion of its tasks.
 * @param TSubResult type of the sub results
 * @param TEndResult type of the end result
 */
export class ScheduledParallelStream<TSubResult, TEndResult> implements IParallelStream<TSubResult, TEndResult> {
  /**
   * The tasks executed by this stream.
   * Already completed tasks are replaced with undefined to free the reference to the task (gc can collect the task)
   */
  private tasks: Array<ITask<TSubResult> | undefined>;

  private innerStream: ParallelStream<TSubResult, TEndResult>;

  /**
   * Resolves the _promise with the given end result
   */
  private resolve!: (result: TEndResult) => void;

  /**
   * Rejects the _promise with the given reason
   */
  private reject!: (reason: any) => void;

  private next!: (subResult: TSubResult, task: number, valuesPerTask: number) => void;

  /**
   * Number of still pending tasks
   */
  private pending: number;

  /**
   * Indicator if any task has failed. If this is the case, then registered next handlers are no longer called
   * for outstanding results.
   * @type {boolean}
   * @private
   */
  private failed: boolean = false;

  /**
   * Function used to join the sub results to the end result
   */
  private joiner: (memo: TSubResult, current: TSubResult) => TEndResult;

  /**
   * The accumulated end result for all yet completed tasks. Is undefined if the stream is complete.
   */
  private endResult: TEndResult | undefined;

  /**
   * Not yet joined sub results
   */
  private subResults: Array<TSubResult | undefined>;

  /**
   * The index of the next expected sub result that should be joined with the end result
   */
  private nextSubResultIndex = 0;

  constructor(
    tasks: ITask<TSubResult>[],
    endResultDefault: TEndResult,
    join: (memo: TSubResult, current: TSubResult) => TEndResult
  ) {
    this.tasks = tasks;
    this.joiner = join;
    this.endResult = endResultDefault;
    this.pending = tasks.length;
    this.subResults = new Array(this.tasks.length);

    this.innerStream = new ParallelStream((next, resolve, reject) => {
      this.next = next;
      this.resolve = resolve;
      this.reject = reject;
    });

    for (const task of tasks) {
      this.registerTaskHandler(task);
    }
  }

  public subscribe(
    onNext: (subResult: TSubResult, worker: number, valuesPerWorker: number) => void,
    onError?: (reason: any) => void,
    onComplete?: (result: TEndResult) => void
  ): IParallelStream<TSubResult, TEndResult> {
    this.innerStream.subscribe(onNext, onError, onComplete);
    return this;
  }

  public then<TResult1, TResult2>(
    onfulfilled: (value: TEndResult) => PromiseLike<TResult1> | TResult1,
    onrejected: (reason: any) => PromiseLike<TResult2> | TResult2
  ): Promise<TResult2 | TResult1>;
  public then<TResult>(
    onfulfilled: (value: TEndResult) => PromiseLike<TResult> | TResult,
    onrejected: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(onfulfilled: (value: TEndResult) => PromiseLike<TResult> | TResult): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TEndResult) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TEndResult) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => void
  ): Promise<TResult>;
  public then(onfulfilled?: any, onrejected?: any): any {
    return this.innerStream.then(onfulfilled, onrejected);
  }

  public catch<TResult>(onrejected: (reason: any) => PromiseLike<TResult> | TResult): Promise<TResult | TEndResult>;
  public catch(onrejected: (reason: any) => PromiseLike<TEndResult> | TEndResult): Promise<TEndResult>;
  public catch(onrejected: any): any {
    return this.innerStream.catch(onrejected);
  }

  private registerTaskHandler(task: ITask<TSubResult>) {
    task.then(
      subResult => this._taskCompleted(subResult, task.definition as IParallelTaskDefinition),
      reason => this._taskFailed(reason)
    );
  }

  private _taskCompleted(subResult: TSubResult, taskDefinition: IParallelTaskDefinition): void {
    if (this.pending === 0) {
      throw new Error("Stream already resolved but taskCompleted called one more time");
    }

    --this.pending;
    this.tasks[taskDefinition.taskIndex] = undefined;
    this.subResults[taskDefinition.taskIndex] = subResult;

    if (this.failed) {
      return;
    }

    this.next(subResult, taskDefinition.taskIndex, taskDefinition.valuesPerTask);

    if (this.nextSubResultIndex === taskDefinition.taskIndex) {
      this.joinSubResults();
    }

    if (this.pending === 0) {
      this.resolve(this.endResult!);
      this.endResult = undefined;
    }
  }

  /**
   * Joins the currently outstanding sub results. The sub results is needed to ensure that the results are joined in
   * task order. This method iterates until it either reaches the end of the sub results or a sub result for a task is
   * missing (undefined, not yet computed).
   * Has a better memory footprint compared to if all subresults are kept.
   */
  private joinSubResults() {
    while (
      this.nextSubResultIndex < this.subResults.length &&
      typeof this.subResults[this.nextSubResultIndex] !== "undefined"
    ) {
      const subResult = this.subResults[this.nextSubResultIndex];
      this.subResults[this.nextSubResultIndex] = undefined;
      this.endResult = this.joiner.apply(undefined, [this.endResult, subResult]);

      ++this.nextSubResultIndex;
    }
  }

  private _taskFailed(reason: any): void {
    if (this.failed === true) {
      return;
    }

    this.failed = true;

    // Cancel all not yet completed tasks
    for (const task of this.tasks) {
      if (typeof task !== "undefined") {
        task.cancel();
      }
    }

    this.reject(reason);
  }
}
