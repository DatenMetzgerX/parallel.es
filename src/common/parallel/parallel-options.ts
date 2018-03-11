/**
 * @module parallel
 */
/** needed, typedoc issue */

import { IThreadPool } from "../thread-pool/thread-pool";
import { IParallelJobScheduler } from "./scheduling/parallel-job-scheduler";
import { FunctionCallSerializer } from "../function/function-call-serializer";

/**
 * Options that affect how a parallel operation is executed.
 */
export interface IParallelOptions {
  /**
   * Serializer used to serialize {@link FunctionCall}s
   */
  functionCallSerializer?: FunctionCallSerializer;

  /**
   * The minimum number of values assigned to a single task before the work is split and assigned another task
   */
  minValuesPerTask?: number;

  /**
   * The maximum number of values assigned to a single task. If the number of values exceed the maxValuesPerTask, an additional
   * task is created to process the values (until the values per Task are less then maxValuesPerTask)
   */
  maxValuesPerTask?: number;

  /**
   * The thread pool to use to schedule the tasks
   */
  threadPool?: IThreadPool;

  /**
   * The scheduler that should be used to determine the number of tasks to create.
   */
  scheduler?: IParallelJobScheduler;

  /**
   * Defines the max degree of parallelism to use for a scheduled job. The value defines in how many task the scheduler is allowed
   * to split the task at most. A value of 1 creates exactly one task. Undefined does not limit the max degree and leaves it to the
   * scheduler to decide.
   * @default undefined / unlimited
   */
  maxDegreeOfParallelism?: number;
}

/**
 * Initialized parallel options
 */
export interface IDefaultInitializedParallelOptions extends IParallelOptions {
  functionCallSerializer: FunctionCallSerializer;
  threadPool: IThreadPool;
  scheduler: IParallelJobScheduler;
}

const greaterThanZeroOptions = ["maxValuesPerTask", "minValuesPerTask", "maxDegreeOfParallelism"];
export function validateOptions(options: IParallelOptions) {
  for (const optionName of greaterThanZeroOptions) {
    const optionValue = (options as { [name: string]: number | undefined })[optionName];
    if (
      typeof optionValue !== "undefined" &&
      (typeof optionValue !== "number" || optionValue <= 0 || optionValue % 1 !== 0)
    ) {
      throw new Error(
        `Illegal parallel options: ${optionName} (${optionValue}) has to be an integer greater than zero`
      );
    }
  }

  if (
    typeof options.minValuesPerTask !== "undefined" &&
    typeof options.maxValuesPerTask !== "undefined" &&
    options.minValuesPerTask > options.maxValuesPerTask
  ) {
    throw new Error(
      `Illegal parallel options: minValuesPerTask (${
        options.minValuesPerTask
      }) must be equal or less than maxValuesPerTask (${options.maxValuesPerTask}).`
    );
  }
}
