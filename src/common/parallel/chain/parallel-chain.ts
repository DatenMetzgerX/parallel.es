/**
 * @module parallel
 */
/** needed, typedoc issue */

import { IParallelStream } from "../stream/parallel-stream";
import { IParallelEnvironment, IParallelTaskEnvironment } from "../parallel-environment";
import { IFunctionId } from "../../function/function-id";

/**
 * The parallel chain allows to chain multiple operations before they are executed on a worker.
 * The parallel job is scheduled onto the thread pool as soon any terminating function like {@link IParallelChain.then}, {@link IParallelChain.catch},
 * {@link IParallelChain.subscribe} or {@link IParallelChain.reduce} is called.
 * @param TIn the input values created by a generator function
 * @param TOut the type of the resulting elements
 * @param TEnv the type of the environment
 */
export interface IParallelChain<TIn, TEnv extends IParallelEnvironment, TOut> extends IParallelStream<TOut[], TOut[]> {
  /**
   * Defines the environment that is provided to all iteratee or generator functions.
   * The environment cannot contain function values. The values of the provided environment is merged with the values
   * of any prior defined environments. If an environment provider is defined, then the values returned by the environment
   * provider have a higher precedence.
   * @param newEnv the environment that is provided to the iteratee function
   */
  inEnvironment<TEnvNew extends IParallelEnvironment>(newEnv: TEnvNew): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * Defines a function that should be used to build the environment for each task. The function is executed first
   * on the scheduled task.
   * @param provider the function providing the environment
   * @param TEnvNew the type of the environment
   * @returns the chain
   */
  inEnvironment<TEnvNew extends IParallelEnvironment>(
    provider: (this: void, taskEnv: TEnv & IParallelTaskEnvironment) => TEnvNew
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;
  inEnvironment<TEnvNew extends IParallelEnvironment>(provider: IFunctionId): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * @param param1 single parameter that is passed to the provider
   * @param TParam1 the type of the single parameter
   */
  inEnvironment<TParam1, TEnvNew extends IParallelEnvironment>(
    provider: (this: void, arg1: TParam1, taskEnv: TEnv & IParallelTaskEnvironment) => TEnvNew,
    param1: TParam1
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   *
   * @param param1 first parameter that is passed to the provider function
   * @param param2 second parameter that is passed to the provider function
   * @param TParam1 type of the first parameter
   * @param TParam2 type of the second parameter
   */
  inEnvironment<TParam1, TParam2, TEnvNew extends IParallelEnvironment>(
    provider: (this: void, arg1: TParam1, arg2: TParam2, taskEnv: TEnv & IParallelTaskEnvironment) => TEnvNew,
    param1: TParam1,
    param2: TParam2
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * @param param3 third parameter that is passed to the provider funciton
   * @param TParam3 type of the third parameter
   */
  inEnvironment<TParam1, TParam2, TParam3, TEnvNew extends IParallelEnvironment>(
    provider: (
      this: void,
      arg1: TParam1,
      arg2: TParam2,
      arg3: TParam3,
      taskEnv: TEnv & IParallelTaskEnvironment
    ) => TEnvNew,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * @param param4 fourth parameter that is passed to the provider function
   * @param TParam4 type of the fourth parameter
   */
  inEnvironment<TParam1, TParam2, TParam3, TParam4, TEnvNew extends IParallelEnvironment>(
    provider: (
      this: void,
      arg1: TParam1,
      arg2: TParam2,
      arg3: TParam3,
      arg4: TParam4,
      taskEnv: TEnv & IParallelTaskEnvironment
    ) => TEnvNew,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * @param furtherParams further paramters that are passed to the provider function
   */
  inEnvironment<TParam1, TParam2, TParam3, TParam4, TEnvNew extends IParallelEnvironment>(
    provider: (
      this: void,
      arg1: TParam1,
      arg2: TParam2,
      arg3: TParam3,
      arg4: TParam4,
      ...furtherParams: any[]
    ) => TEnvNew,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4,
    ...furtherParams: any[]
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut>;

  /**
   * Maps all input values to an output value using the given mapper. The mapper is applied for each input element
   * @param mapper the mapper to apply for each element
   * @param TResult the type of the resulting elements
   */
  map<TResult>(
    mapper: (this: void, element: TOut, env: TEnv & IParallelTaskEnvironment) => TResult
  ): IParallelChain<TIn, TEnv, TResult>;
  map<TResult>(mapper: IFunctionId): IParallelChain<TIn, TEnv, TResult>;

  /**
   * Reduces the elements to a single value using the given accumulator. The accumulator is invoked with the - up to now - accumulated value
   * and the current element and returns the sum of the accumulated value and the current value.
   * @param defaultValue default value to use to initialize the accumulator
   * @param accumulator the accumulator function
   * @returns parallel stream that allows to query the end result
   */
  reduce(
    defaultValue: TOut,
    accumulator: (this: void, memo: TOut, value: TOut, env: TEnv & IParallelTaskEnvironment) => TOut
  ): IParallelStream<TOut[], TOut>;
  reduce(defaultValue: TOut, accumulator: IFunctionId): IParallelStream<TOut[], TOut>;

  /**
   * Reduces the elements to a single value using the givne accumulator. The accumulator is invoked with the - up to now - accumulated value
   * and the current element and returns the sum of the accumulated value and the current value.
   * @param defaultValue default value to use to initialize the accumulator
   * @param accumulator the accumulator function
   * @param joiner joiner that is used to accumulate the sub results created by each task.
   * @param TResult type of the end result
   * @returns parallel stream that allows to query the end result
   */
  reduce<TResult>(
    defaultValue: TResult,
    accumulator: (this: void, memo: TResult, value: TOut, env: TEnv & IParallelTaskEnvironment) => TResult,
    combiner: (this: void, subResult1: TResult, subResult2: TResult) => TResult
  ): IParallelStream<TResult[], TResult>;
  reduce<TResult>(
    defaultValue: TResult,
    accumulator: IFunctionId,
    combiner: (this: void, subResult1: TResult, subResult2: TResult) => TResult
  ): IParallelStream<TResult[], TResult>;

  /**
   * Filters the input elements using the given predicate
   * @param predicate the predicate to use to filter the elements
   */
  filter(
    predicate: (this: void, value: TOut, env: TEnv & IParallelTaskEnvironment) => boolean
  ): IParallelChain<TIn, TEnv, TOut>;
  filter(predicate: IFunctionId): IParallelChain<TIn, TEnv, TOut>;

  // sortBy?
  // split? Allows to reuse the same intermediate result for multiple succeeding calls.
}
