import { IDefaultInitializedParallelOptions } from "../parallel-options";
import { AbstractParallelScheduler, IParallelTaskScheduling } from "./abstract-parallel-scheduler";

/**
 * Default implementation of a parallel scheduler.
 * By default, creates 4 times as many tasks as the hardware concurrency allows ({@link IParallelOptions.maxConcurrencyLevel}).
 *
 * If the options define {@link IParallelOptions.maxValuesPerTask} or {@link IParallelOptions.minValuesPerTask}, then the
 * values are adjusted accordingly.
 */
export class DefaultParallelScheduler extends AbstractParallelScheduler {
  public getScheduling(
    totalNumberOfValues: number,
    options: IDefaultInitializedParallelOptions
  ): IParallelTaskScheduling {
    let maxDegreeOfParallelism: number;

    if (options.maxDegreeOfParallelism) {
      maxDegreeOfParallelism = options.maxDegreeOfParallelism;
    } else {
      maxDegreeOfParallelism = options.threadPool.maxThreads * 4;
    }

    let valuesPerTask = totalNumberOfValues / maxDegreeOfParallelism;

    if (options.minValuesPerTask) {
      valuesPerTask = Math.min(Math.max(valuesPerTask, options.minValuesPerTask), totalNumberOfValues);
    }

    if (options.maxValuesPerTask) {
      valuesPerTask = Math.min(valuesPerTask, options.maxValuesPerTask);
    }

    valuesPerTask = Math.ceil(valuesPerTask);

    return {
      numberOfTasks: valuesPerTask === 0 ? 0 : Math.ceil(totalNumberOfValues / valuesPerTask),
      valuesPerTask
    };
  }
}
