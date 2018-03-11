/**
 * @module parallel
 */
/** needed, typedoc issue */

import { IParallelChain } from "./chain/parallel-chain";
import { IParallelOptions, IDefaultInitializedParallelOptions } from "./parallel-options";
import { IParallelTaskEnvironment, IParallelEnvironment } from "./parallel-environment";
import { ITask } from "../task/task";
import { IFunctionId } from "../function/function-id";

/**
 * Main facade used to start parallel tasks.
 * Uses a chaining api. A new parallel task is created using a generator function like `from`, `range` or `times`.
 * This returns an {@link IParallelChain} that is used to define the operations to perform on the elements. The parallel job
 * is scheduled onto the thread pool as soon as a terminating function ({@link IParallelChain.then}, {@link IParallelChain.catch},
 * {@link IParallelChain.subscribe} or {@link IParallelChain.reduce}) is called.
 */
export interface IParallel {
  /**
   * Returns a copy of the default options
   * @returns the current default options
   */
  defaultOptions(): IDefaultInitializedParallelOptions;

  /**
   * Sets the default options used whenever a parallel task is started
   * @param options the default options. The options are merged with the existing default options.
   * To unset a value, explicitly assign undefined (not allowed for the mandatory values threadPool and maxConcurrencyLevel).
   * @returns the current default options
   */
  defaultOptions(options: IParallelOptions): void;

  /**
   * Creates a new parallel chain that transforms the given array. The elements processed are distributed onto different
   * workers.
   * @param data the array with the elements
   * @param options options options overriding the default options.
   * @param T type of the array elements
   */
  from<T>(data: T[], options?: IParallelOptions): IParallelChain<T, {}, T>;

  /**
   * Creates an array containing the elements in the range from start (inclusive) to end (exclusive) with the step size of step.
   * @param start the start of the range or the end, if the function is called with a single argument
   * @param end the end of the range
   * @param step the step size.
   * @param options options configuring the computation behaviour
   * @throws if step size is equal to zero
   */
  range(start: number, end?: number, step?: number, options?: IParallelOptions): IParallelChain<number, {}, number>;

  /**
   * Creates a new array containing the given value n times.
   * @param n how many time should the value be repeated
   * @param value the value to repeat
   * @param TValue type of the value
   */
  times<TValue>(n: number, value: TValue): IParallelChain<TValue, IParallelEnvironment, TValue>;

  /**
   * Creates a new array through calling the generator n times
   * @param n how many elements should be created using the provided generator
   * @param generator the generator used to create the array elements
   * @param TResult type of the elements returned by the generator
   */
  times<TResult>(
    n: number,
    generator: (this: void, n: number, env: IParallelTaskEnvironment) => TResult
  ): IParallelChain<TResult, IParallelEnvironment, TResult>;
  times<TResult>(n: number, generator: IFunctionId): IParallelChain<TResult, IParallelEnvironment, TResult>;

  /**
   * @param env environment that is provided to the iteratee function
   * @param options options configuring the computation behaviour
   * @param TEnv type of the environment
   */
  times<TEnv extends IParallelEnvironment, TResult>(
    n: number,
    generator: (this: void, n: number, env: TEnv & IParallelTaskEnvironment) => TResult,
    env: TEnv,
    options?: IParallelOptions
  ): IParallelChain<TResult, TEnv, TResult>;
  times<TEnv extends IParallelEnvironment, TResult>(
    n: number,
    generator: IFunctionId,
    env: TEnv,
    options?: IParallelOptions
  ): IParallelChain<TResult, TEnv, TResult>;

  /**
   * Runs the passed in function on an available worker. If no worker is available, then the
   * function is queued until another task completes and therefore a worker is released.
   * @param func the function to execute on the worker. The function is executed in the context of a worker (no shared memory) and
   * therefore as limited access to global variables and the dom.
   * @param TResult the type of the result returned by the scheduled function
   * @returns the scheduled task.
   */
  run<TResult>(func: (this: void) => TResult): ITask<TResult>;

  /**
   * @param param1 sole parameter that is passed to the function
   * @param TParam1 type of the parameter passed to the function
   */
  run<TParam1, TResult>(func: (this: void, param1: TParam1) => TResult, param1: TParam1): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   */
  run<TParam1, TParam2, TResult>(
    func: (this: void, param1: TParam1, param2: TParam2) => TResult,
    param1: TParam1,
    param2: TParam2
  ): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   * @param param3 the third parameter that is passed to the scheduled function
   * @param TParam3 type of the third function parameter
   */
  run<TParam1, TParam2, TParam3, TResult>(
    func: (this: void, param1: TParam1, param2: TParam2, param3: TParam3) => TResult,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3
  ): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   * @param param3 the third parameter that is passed to the scheduled function
   * @param TParam3 type of the third function parameter
   * @param param4 the fourth parameter that is passed to the scheduled function
   * @param TParam4 type of the fourth function parameter
   */
  run<TParam1, TParam2, TParam3, TParam4, TResult>(
    func: (this: void, param1: TParam1, param2: TParam2, param3: TParam3, param4: TParam4) => TResult,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4
  ): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   * @param param3 the third parameter that is passed to the scheduled function
   * @param TParam3 type of the third function parameter
   * @param param4 the fourth parameter that is passed to the scheduled function
   * @param TParam4 type of the fourth function parameter
   * @param param5 the fifth parameter that is passed to the scheduled function
   * @param TParam5 type of the fifth function parameter
   */
  run<TParam1, TParam2, TParam3, TParam4, TParam5, TResult>(
    func: (this: void, param1: TParam1, param2: TParam2, param3: TParam3, param4: TParam4, param5: TParam5) => TResult,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4,
    param5: TParam5
  ): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   * @param param3 the third parameter that is passed to the scheduled function
   * @param TParam3 type of the third function parameter
   * @param param4 the fourth parameter that is passed to the scheduled function
   * @param TParam4 type of the fourth function parameter
   * @param param5 the fifth parameter that is passed to the scheduled function
   * @param TParam5 type of the fifth function parameter
   * @param param6 the sixth parameter that is passed to the scheduled function
   * @param TParam6 type of the sixth function parameter
   */
  run<TParam1, TParam2, TParam3, TParam4, TParam5, TParam6, TResult>(
    func: (
      this: void,
      param1: TParam1,
      param2: TParam2,
      param3: TParam3,
      param4: TParam4,
      param5: TParam5,
      param6: TParam6
    ) => TResult,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4,
    param5: TParam5,
    param6: TParam6
  ): ITask<TResult>;

  /**
   * @param param1 the first parameter that is passed to the scheduled function
   * @param TParam1 type of the first parameter
   * @param param2 the second parameter that is passed to the scheduled function
   * @param TParam2 type of the second function parameter
   * @param param3 the third parameter that is passed to the scheduled function
   * @param TParam3 type of the third function parameter
   * @param param4 the fourth parameter that is passed to the scheduled function
   * @param TParam4 type of the fourth function parameter
   * @param param5 the fifth parameter that is passed to the scheduled function
   * @param TParam5 type of the fifth function parameter
   * @param param6 the sixth parameter that is passed to the scheduled function
   * @param TParam6 type of the sixth function parameter
   * @param furtherParams further params that are passed to the scheduled function
   */
  run<TParam1, TParam2, TParam3, TParam4, TParam5, TParam6, TResult>(
    func: (
      this: void,
      param1: TParam1,
      param2: TParam2,
      param3: TParam3,
      param4: TParam4,
      param5: TParam5,
      param6: TParam6,
      ...furtherParams: any[]
    ) => TResult,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3,
    param4: TParam4,
    param5: TParam5,
    param6: TParam6,
    ...furtherParams: any[]
  ): ITask<TResult>;

  /**
   * Schedules the function with the given id
   * @param func the id of the function
   * @param params the params to pass to the function
   */
  run<TResult>(func: IFunctionId, ...params: any[]): ITask<TResult>;
}
