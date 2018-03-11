import { ITask } from "./task";
import { ITaskDefinition } from "./task-definition";

/**
 * Default implementation of a task. Keeps the state of a state and allows to register handlers that are invoked
 * in case of task completion or error.
 */
export class WorkerTask<T> implements ITask<T> {
  public isCancellationRequested = false;
  public isCanceled = false;

  private resolvePromise!: (result?: T) => void;
  private rejectPromise!: (error: any) => void;
  private promise: Promise<T>;

  /**
   * Creates a new worker task that executes the operation defined by the given definition
   * @param definition the definition of the operation to execute
   */
  constructor(public definition: ITaskDefinition) {
    this.promise = new Promise<T>((resolvePromise, rejectPromise) => {
      this.resolvePromise = resolvePromise;
      this.rejectPromise = rejectPromise;
    });
  }

  /**
   * Marks the task as complete where the given value is the task result. Triggers all registered `then` handlers of the promise.
   * However, if the task has been cancelled in the mean time, then the `catch` handlers are triggered instead
   * @param result the result of the task execution
   */
  public resolve(result: T) {
    if (this.isCancellationRequested) {
      this.resolveCancelled();
    } else {
      this.resolvePromise(result);
    }
  }

  /**
   * Resolves a task that has been cancelled before start.
   * Triggers all the `catch` handlers.
   */
  public resolveCancelled() {
    this.isCanceled = true;
    this.reject("Task has been canceled");
  }

  /**
   * Marks the task as failed
   * @param error the error that occurred while processing the task
   */
  public reject(error: any) {
    this.rejectPromise(error);
  }

  public then<TResult>(
    onfulfilled: (value: T) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult> {
    if (onrejected) {
      return this.promise.then(onfulfilled, onrejected);
    }
    return this.promise.then(onfulfilled);
  }

  public catch(onrejected: (reason: any) => PromiseLike<any> | any): Promise<any> {
    return this.promise.catch(onrejected);
  }

  public cancel(): void {
    this.isCancellationRequested = true;
  }
}
