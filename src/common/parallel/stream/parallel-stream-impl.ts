import { IPromise } from "../../util/promise";
import { IParallelStream } from "./parallel-stream";
import { ScheduledParallelStream } from "./scheduled-parallel-stream";
import { ResolvedParallelStream } from "./resolved-parallel-stream";
import { ITask } from "../../task/task";

/**
 * Function that resolves the next sub result for a parallel stream
 * @param subResult the sub result
 * @param taskIndex the job relative index of the task that has computed the sub result
 * @param valuesPerTask the number of values each task has to process at most
 * @param TSubResult type of the sub result
 */
export type INextCallback<TSubResult> = (subResult: TSubResult, taskIndex: number, valuesPerTask: number) => any;

/**
 * Function that resolves the end result of a parallel stream
 * @param result the end result of the stream
 * @param TEndResult type of the end result
 */
export type IResolveCallback<TEndResult> = (result: TEndResult) => any;

/**
 * Function to reject a parallel stream
 * @param reason the rejection reason
 */
export type IRejectCallback = (reason: any) => any;

/**
 * Callback that is invoked for a new {@link ParallelStream}
 *
 * @param next callback to invoke to trigger the next sub result
 * @param resolve callback to invoke to resolve the stream
 * @param reject callback to invoke to reject the stream
 */
export type IExecutorCallback<TSubResult, TEndResult> = (
  next: INextCallback<TSubResult>,
  resolve: IResolveCallback<TEndResult>,
  reject: IRejectCallback
) => any;

type NextHandler<TSubResult> = (subResult: TSubResult, worker: number, valuesPerWorker: number) => void;

/**
 * Generic parallel stream that can be coordinated using the provided next, resolve and reject callbacks.
 * @param TSubResult type of the sub results
 * @param TEndResult type of the end result
 */
export class ParallelStream<TSubResult, TEndResult = TSubResult> implements IParallelStream<TSubResult, TEndResult> {
  /**
   * Creates a new parallel that is based on the given input stream but transforms the end result using the given transformer
   * @param inputStream the input stream on which the returned stream is based on
   * @param transformer the transformer used to transform the end result
   * @param TIn type of the input elements for this stream
   * @param TIntermediate type of the end results from the input stream
   * @param TResult end result after applying the transformer.
   * @returns parallel stream that is based on the given input stream but with the transformed end result
   */
  public static transform<TIn, TIntermediate, TResult>(
    inputStream: IParallelStream<TIn, TIntermediate>,
    transformer: (result: TIntermediate) => TResult
  ) {
    let next: ((subResult: TIn, taskIndex: number, valuesPerTask: number) => void) | undefined;
    let resolve: ((result: TResult) => void) | undefined;
    let reject: ((reason: any) => void) | undefined;

    const transformedStream = new ParallelStream<TIn, TResult>((nxt, rsolve, rject) => {
      next = nxt;
      resolve = rsolve;
      reject = rject;
    });

    inputStream.subscribe(next!, reject!, result => resolve!(transformer(result)));

    return transformedStream;
  }

  /**
   * Creates a new parallel stream for the given set of tasks.
   * @param tasks the set of tasks that compute the results of the stream
   * @param defaultResult the default result
   * @param joiner the joiner to use to join two computed task results
   * @param TTaskResult type of the task results
   * @param TEndResult result of the created stream. Created by applying the end results of the stream to the joiner
   * @returns stream for the given set of tasks
   */
  public static fromTasks<TTaskResult, TEndResult>(
    tasks: ITask<TTaskResult>[],
    defaultResult: TEndResult,
    joiner: (memo: TTaskResult, current: TTaskResult) => TEndResult
  ): IParallelStream<TTaskResult, TEndResult> {
    if (tasks.length === 0) {
      return new ResolvedParallelStream(defaultResult);
    }

    return new ScheduledParallelStream(tasks, defaultResult, joiner);
  }

  private promise: Promise<TEndResult>;

  /**
   * Registered handlers that should be called for each sub result
   * @type {Array}
   * @private
   */
  private nextHandlers: NextHandler<TSubResult>[] = [];
  private resolve!: (result: TEndResult) => void;
  private reject!: (reason: any) => void;

  /**
   * Creates a new, generic parallel stream
   * @param executor the executor function that gets passed the next, resolve and reject functions
   */
  constructor(executor: IExecutorCallback<TSubResult, TEndResult>) {
    const next = (subResult: TSubResult, worker: number, valuesPerWorker: number) =>
      this._next(subResult, worker, valuesPerWorker);
    const reject = (reason: any) => this.reject(reason);
    const resolve = (result: TEndResult) => this.resolve(result);

    executor(next, resolve, reject);

    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }

  public subscribe(
    onNext: (subResult: TSubResult, taskIndex: number, valuesPerWorker: number) => void,
    onError?: (reason: any) => void,
    onComplete?: (result: TEndResult) => void
  ): IParallelStream<TSubResult, TEndResult> {
    this.nextHandlers.push(onNext);

    if (onError || onComplete) {
      this.promise.then(onComplete!, onError!);
    }

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
  public then<TResult>(onfulfilled: (value: TEndResult) => PromiseLike<TResult> | TResult): IPromise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TEndResult) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TEndResult) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => void
  ): Promise<TResult>;
  public then(onfulfilled?: any, onrejected?: any): any {
    return this.promise.then(onfulfilled, onrejected);
  }

  public catch<TResult>(onrejected: (reason: any) => PromiseLike<TResult> | TResult): Promise<TResult | TEndResult>;
  public catch(onrejected: (reason: any) => PromiseLike<TEndResult> | TEndResult): Promise<TEndResult>;
  public catch(onrejected: any): any {
    return this.promise.catch(onrejected);
  }

  private _next(subResult: TSubResult, taskIndex: number, valuesPerTask: number) {
    for (const nextHandler of this.nextHandlers) {
      nextHandler.apply(undefined, arguments);
    }
  }
}
