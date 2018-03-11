import { toArray } from "../../util/arrays";
import { FunctionCallDeserializer } from "../../function/function-call-deserializer";
import { ISerializedFunctionCall, isSerializedFunctionCall } from "../../function/serialized-function-call";
import { ISerializedParallelOperation, IParallelEnvironment, IParallelTaskEnvironment } from "../";

/**
 * Defines the parallel operation to perform
 */
export interface IParallelJobDefinition {
  /**
   * The generator that is used to create the array that is "manipulated" by applying the given actions.
   */
  generator: ISerializedFunctionCall;

  /**
   * The operations to perform on the array elements
   */
  operations: ISerializedParallelOperation[];

  /**
   * The environments. Object hash that is passed to all iteratee functions and allows to access external data
   */
  environments: Array<ISerializedFunctionCall | IParallelEnvironment>;

  /**
   * The job-relative index of the task
   */
  taskIndex: number;

  /**
   * The number of values processed by each task (at most)
   */
  valuesPerTask: number;
}

function createTaskEnvironment(
  definition: IParallelJobDefinition,
  functionCallDeserializer: FunctionCallDeserializer
): IParallelTaskEnvironment {
  let taskEnvironment: IParallelTaskEnvironment = {
    taskIndex: definition.taskIndex,
    valuesPerTask: definition.valuesPerTask
  };

  for (const environment of definition.environments) {
    let currentEnvironment: IParallelEnvironment;
    if (isSerializedFunctionCall(environment)) {
      currentEnvironment = functionCallDeserializer.deserializeFunctionCall(environment)(taskEnvironment);
    } else {
      currentEnvironment = environment;
    }
    taskEnvironment = Object.assign(taskEnvironment, currentEnvironment);
  }

  return taskEnvironment;
}

/**
 * Main coordination function for any operation performed using {@link IParallel}.
 * @param definition the definition of the operation to performed
 * @param options options passed from the thread pool
 * @param T type of the elements created by the generator
 * @param TResult type of the resulting elements
 * @returns the result of the operation from this worker
 */
export function parallelJobExecutor<T, TResult>(
  definition: IParallelJobDefinition,
  { functionCallDeserializer }: { functionCallDeserializer: FunctionCallDeserializer }
): TResult[] {
  const environment = createTaskEnvironment(definition, functionCallDeserializer);
  const generatorFunction = functionCallDeserializer.deserializeFunctionCall(definition.generator, true);
  let iterator = generatorFunction(environment) as Iterator<T>;

  for (const operation of definition.operations) {
    const iteratorFunction = functionCallDeserializer.deserializeFunctionCall<Iterator<T>>(operation.iterator);
    const iteratee = functionCallDeserializer.deserializeFunctionCall(operation.iteratee);
    iterator = iteratorFunction(iterator, iteratee, environment);
  }

  return toArray<TResult>(iterator as any);
}
