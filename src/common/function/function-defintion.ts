/**
 * @module parallel
 */
/** */

import { IFunctionId } from "./function-id";

/**
 * Serialized representation of a function.
 */
export interface IFunctionDefinition {
  /**
   * Unique identification of the function
   */
  readonly id: IFunctionId;

  /**
   * The name of the function
   */
  readonly name?: string;

  /**
   * The names of the function arguments
   */
  readonly argumentNames: string[];

  /**
   * The body of the function as string
   */
  readonly body: string;
}
