/**
 * @module parallel
 */
/** needed, typedoc issue */

import { ITask } from "../task/task";
import { ITaskDefinition } from "../task/task-definition";

/**
 * The thread pool is responsible for distributing the scheduled tasks onto different workers. The thread pool defines how the
 * queued tasks are scheduled onto the available workers and how many workers are created.
 */
export interface IThreadPool {
  /**
   * Maximum number of threads that the thread pool should scheduled. Default initialized with the
   * number of the hardware concurrency supported by the hardware.
   * The value cannot be negative or 0
   */
  maxThreads: number;

  /**
   * Schedules the passed in task definition onto an available worker or enqueues the task to be scheduled as soon as a worker gets available.
   * @param task the task to schedule
   */
  run<TResult>(task: ITaskDefinition): ITask<TResult>;
}
