import { ISerializedFunctionCall } from "../function/serialized-function-call";
import { FunctionCall } from "../function/function-call";

/**
 * Single parallel operation to perform
 */
export interface IParallelOperation {
  /**
   * Iteratee that should be invoked for each element
   */
  readonly iteratee: FunctionCall;

  /**
   * Iterator function that applies the iteratee to each element and creates a new iterator
   */
  readonly iterator: FunctionCall;
}

/**
 * Serialized representation of a parallel operation
 */
export interface ISerializedParallelOperation {
  /**
   * The iteratee function that should be called for each element
   */
  readonly iteratee: ISerializedFunctionCall;

  /**
   * The iterator that applies the iteratee for each element and creates a new iterator
   */
  readonly iterator: ISerializedFunctionCall;
}
