/**
 * @module parallel
 */
/** */

import { IFunctionId } from "./function-id";
import { ISerializedFunctionCall } from "./serialized-function-call";

/**
 * Represents a function call
 */
export class FunctionCall {
  /**
   * Creates a new function call for a function without any arguments
   * @param func the function to call
   * @returns the function call
   */
  public static create(func: () => any): FunctionCall;

  /**
   * Creates a new function call to a function accepting a single argument
   * @param func the function to call
   * @param param1 the single parameter passed to the function
   * @param TParam1 type of the single parameter
   * @returns the function call
   */
  public static create<TParam1>(func: (arg1: TParam1) => any, param1: TParam1): FunctionCall;

  /**
   * Creates a new function call to a function passing the given parameters
   * @param func the function to call
   * @param param1 the first parameter to pass to the function
   * @param param2 the second parameter to pass to the function
   * @param TParam1 type of the first parameter
   * @param TParam2 type of the second parameter
   * @returns the function call
   */
  public static create<TParam1, TParam2>(
    func: (arg1: TParam1, arg2: TParam2) => any,
    param1: TParam1,
    param2: TParam2
  ): FunctionCall;

  /**
   * @param param3 the third parameter to pass to the function
   * @param TParam3 the type of the third parameter
   */
  public static create<TParam1, TParam2, TParam3>(
    func: (arg1: TParam1, arg2: TParam2, arg3: TParam3) => any,
    param1: TParam1,
    param2: TParam2,
    param3: TParam3
  ): FunctionCall;

  public static create(func: IFunctionId, ...params: any[]): FunctionCall;

  public static create(func: IFunctionId | ((...args: any[]) => any), ...args: any[]): FunctionCall {
    return new FunctionCall(func, args);
  }

  /**
   * Creates a function call for a function with with many arguments
   * @param func the function to call
   * @param params the parameters to pass
   * @returns the function call
   */
  public static createUnchecked(func: Function | IFunctionId, ...params: any[]) {
    return new FunctionCall(func, params);
  }

  /**
   * Creates a function call instance from its serialized representation
   * @param serialized the serialized function call
   * @returns {FunctionCall} the function call
   */
  public static fromSerialized(serialized: ISerializedFunctionCall): FunctionCall {
    return new FunctionCall(serialized.functionId, serialized.parameters);
  }

  /**
   * The function to call
   */
  public func: Function | IFunctionId;

  /**
   * The parameters to pass to the function when calling it
   */
  public params: any[];

  private constructor(func: Function | IFunctionId, params: any[]) {
    this.func = func;
    this.params = params;
  }
}
