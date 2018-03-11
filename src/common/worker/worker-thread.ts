/**
 * @module parallel
 */
/** */

import { ITaskDefinition } from "../task/task-definition";

/**
 * Abstraction of a thread that is used to execute a {@link ITask}. A worker thread
 * can execute one {@link ITask} at a time. It may consist of two parts. The worker thread that resists
 * in the main thread and acts as facade to the underlining worker slave. The worker slave executes the tasks
 * scheduled on the worker thread in a dedicated environment, e.g. a web worker or child process. The worker slave
 * normally does not resist in the main thread memory and communicates with the worker thread using messaging
 *
 * Acts as abstraction of the actually used environment (node, browser...)
 */
export interface IWorkerThread {
  /**
   * Unique id of this worker thread
   */
  id: number;

  /**
   * Executes the given task on this worker thread. The given callback is invoked when the task has completed
   * @param task the task to execute
   * @param callback the callback to invoke when the execution has complted. The callback is invoked either with an error
   * or a result, depending on the outocome of the execution
   */
  run(task: ITaskDefinition, callback: (error: any, result: any) => void): void;

  /**
   * Stops the worker as soon as possible. An already started task on this worker thread might be interrupted or is prevented from starting at all.
   */
  stop(): void;
}

export default IWorkerThread;
