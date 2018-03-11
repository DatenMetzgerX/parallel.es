/**
 * @module parallel
 */
/** needed, typedoc issue */

import { IPromise } from "../../util/promise";

/**
 * Parallel processing stream that allows access to the sub results or end result of a {@link IParallelJob}
 *
 * The end result can be retrieved by using the then function. The then function is called
 * with the merged result of all tasks. At the other hand, subscribe can be used to register an
 * onNext handler that is called with the result of every spawned task. This allows to stream to the
 * task results and using intermediate results until all tasks have completed.
 *
 * Catch can be used to register to task failures. Without a catch handler, task failures are silently ignored.
 * The stream implements a fast fail interface. If any task fail, all other tasks are canceled.
 * @param TSubResult the results produced by a single task that needs to be joined to the end result
 * @param TEndResult the joined result of all tasks.
 */
export interface IParallelStream<TSubResult, TEndResult> extends IPromise<TEndResult> {
  /**
   * Registers the given next, error and complete handler.
   * @param onNext is called with the sub result produced by a completed task. The sub result of this task, the relative
   * task number and the values processed by each worker (max) is passed to the onNext handler.
   * @param onError is invoked whenever any task has failed.
   * @param onComplete is invoked with the joined result when all tasks have completed
   */
  subscribe(
    onNext: (this: void, subResult: TSubResult, taskIndex: number, valuesPerWorker: number) => void,
    onError?: (this: void, reason: any) => void,
    onComplete?: (this: void, result: TEndResult) => void
  ): IParallelStream<TSubResult, TEndResult>;
}
