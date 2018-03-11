import { IFunctionId } from "./function-id";
/**
 * Allows looking up a function by its {@link IFunctionDefinition.id} id.
 */
export interface IFunctionLookupTable {
  /**
   * Returns the function with the given id or undefined if no such function is registered.
   * @param id the id of the function to look up
   * @returns the function with the given id, if available, undefined otherwise
   */
  getFunction(id: IFunctionId): Function | undefined;

  /**
   * Registers a static function definition
   * @param id the id of the function
   * @param Function the function
   */
  registerStaticFunction(id: IFunctionId, func: Function): void;
}
