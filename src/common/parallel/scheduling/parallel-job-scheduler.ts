/**
 * @module parallel
 */
/** needed, typedoc issue */

import { ITask } from "../../task/task";
import { IParallelJob } from "../parallel-job";

/**
 * Scheduler that defines onto how many task a parallel job should be scheduled on and how many values to assign
 * to each task.
 */
export interface IParallelJobScheduler {
  /**
   * Schedules the given job onto the thread pool
   * @param job the job to schedule
   * @param TResult type of the result of a single task
   * @returns the scheduled tasks for the given job
   */
  schedule<TResult>(job: IParallelJob): ITask<TResult>[];
}
