/**
 * @module parallel
 */
/** */

import { ISerializedFunctionCall } from "./serialized-function-call";
import { DynamicFunctionRegistry } from "./dynamic-function-registry";
import { FunctionCall } from "./function-call";

/**
 * Serializer for function calls
 */
export class FunctionCallSerializer {
  /**
   * Creates a new instances that uses the given function registry to lookup the unique id of a function
   * @param functionRegistry the registry for function lookup
   */
  constructor(private functionRegistry: DynamicFunctionRegistry) {}

  /**
   * Serializes a call to the given function and using the passed parameters
   * @param call the function call to serialize
   * @returns a serialized representation of a call to the passed function using the given parameters
   */
  public serializeFunctionCall(call: FunctionCall): ISerializedFunctionCall {
    const funcId = this.functionRegistry.getOrSetId(call.func);
    return {
      ______serializedFunctionCall: true,
      functionId: funcId,
      parameters: call.params
    };
  }
}
