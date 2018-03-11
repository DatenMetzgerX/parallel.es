import { IParallelJob, IDefaultInitializedParallelOptions, IParallelOperation } from "../";
import { ITask } from "../../task/task";
import { ITaskDefinition } from "../../task/task-definition";
import { IParallelTaskDefinition } from "../parallel-task-definition";
import { FunctionCallSerializer } from "../../function/function-call-serializer";
import { FunctionCall } from "../../function/function-call";
import { IParallelJobScheduler } from "./parallel-job-scheduler";
import { ParallelWorkerFunctionIds } from "../slave/parallel-worker-functions";
import { IParallelJobDefinition } from "../slave/parallel-job-executor";
import { flattenArray } from "../../util/arrays";
import { isSerializedFunctionCall } from "../../function/serialized-function-call";

export abstract class AbstractParallelScheduler implements IParallelJobScheduler {
  public schedule<TResult>(job: IParallelJob): ITask<TResult>[] {
    const taskDefinitions = this.getTaskDefinitions(job);
    return taskDefinitions.map(taskDefinition => job.options.threadPool.run(taskDefinition));
  }

  /**
   * Returns the suggested scheduling for the given number of values - while concerning the passed in options.
   * @param totalNumberOfValues the total number of values to be processed by the parallel operation chain
   * @param options the parallel options provided for this operation chain
   */
  public abstract getScheduling(
    totalNumberOfValues: number,
    options: IDefaultInitializedParallelOptions
  ): IParallelTaskScheduling;

  private getTaskDefinitions(job: IParallelJob): ITaskDefinition[] {
    const scheduling = this.getScheduling(job.generator.length, job.options);
    const functionCallSerializer = job.options.functionCallSerializer;

    const environments = job.environment.toJSON(functionCallSerializer);
    const operations = this.serializeOperations(job.operations, functionCallSerializer);
    const commonFunctionIds = [ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR].concat(
      flattenArray(operations.map(operation => [operation.iteratee.functionId, operation.iterator.functionId]))
    );

    environments.forEach(provider => {
      if (isSerializedFunctionCall(provider)) {
        commonFunctionIds.push(provider.functionId);
      }
    });

    const taskDefinitions: ITaskDefinition[] = [];
    for (let i = 0; i < scheduling.numberOfTasks; ++i) {
      const generator = job.generator.serializeSlice(i, scheduling.valuesPerTask, functionCallSerializer);

      const processParams: IParallelJobDefinition = {
        environments,
        generator,
        operations,
        taskIndex: i,
        valuesPerTask: scheduling.valuesPerTask
      };

      const taskDefinition: IParallelTaskDefinition = {
        main: functionCallSerializer.serializeFunctionCall(
          FunctionCall.createUnchecked(ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR, processParams)
        ),
        taskIndex: i,
        usedFunctionIds: [generator.functionId].concat(commonFunctionIds),
        valuesPerTask: scheduling.valuesPerTask
      };

      taskDefinitions.push(taskDefinition);
    }
    return taskDefinitions;
  }

  private serializeOperations(operations: IParallelOperation[], functionCallSerializer: FunctionCallSerializer) {
    return operations.map(operation => ({
      iteratee: functionCallSerializer.serializeFunctionCall(operation.iteratee),
      iterator: functionCallSerializer.serializeFunctionCall(operation.iterator)
    }));
  }
}

/**
 * Defines how a parallel task should be scheduled on the thread pool
 */
export interface IParallelTaskScheduling {
  /**
   * How many number of tasks should be created to perform the operation
   */
  numberOfTasks: number;

  /**
   * How many values to process by each task (at most)
   */
  valuesPerTask: number;
}
