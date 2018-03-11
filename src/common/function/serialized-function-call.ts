/**
 * @module parallel
 */
/** */

import { IFunctionId } from "./function-id";

/**
 * Serialized representation of a function call
 */
export interface ISerializedFunctionCall {
  /**
   * The id of the function to invoke ({@link IFunctionDefinition.id})
   */
  functionId: IFunctionId;

  /**
   * The parameters to pass to the function when called
   */
  readonly parameters: any[];

  /**
   * Marker that indicates that this object is a serialized function call
   */
  readonly ______serializedFunctionCall: boolean;
}

/**
 * Tests if the given object is a serialized function call
 * @param potentialFunc a potentially serialized function call
 * @returns {boolean} true if it is a serialized function call, false otherwise
 */
export function isSerializedFunctionCall(potentialFunc: any): potentialFunc is ISerializedFunctionCall {
  return !!potentialFunc && potentialFunc.______serializedFunctionCall === true;
}
