/**
 * @module parallel
 */
/** */

import { ITaskDefinition } from "./task-definition";
import { IPromise } from "../util/promise";

/**
 * Represents a task that has been scheduled on a {@link IThreadPool} or is actually in execution.
 * The task result can be retrieved by registering a callback using {@link PromiseLike.then} that is invoked with the task result.
 * Any occurring errors are silently ignored if no explicit exception handler is registered using {@link ITask.catch}.
 * @param T type of the computed result
 */
export interface ITask<T> extends IPromise<T> {
  /**
   * The underlining task definition that describes the executed task
   */
  definition: ITaskDefinition;

  /**
   * Indicator if this task has been canceled.
   */
  isCanceled: boolean;

  /**
   * Indicator if this task should be canceled but has not yet
   */
  readonly isCancellationRequested: boolean;

  /**
   * Cancels the given task. Triggers an error that the task has been canceled.
   * This has only an effect if the task has not yet been scheduled. An already scheduled task will compute till the end, but
   * the then handler will not be invoked.
   */
  cancel(): void;
}
