import { IFunctionDefinition } from "./function-defintion";
import { SimpleMap } from "../util/simple-map";
import { IFunctionId, functionId, isFunctionId } from "./function-id";
import { getFunctionName } from "../util/function-name";

/**
 * Lookup table for resolving dynamic functions and their definitions
 */
export class DynamicFunctionRegistry {
  private ids = new SimpleMap<string, IFunctionId>();
  private definitions = new SimpleMap<string, IFunctionDefinition>();
  private lastId = 0;

  /**
   * Returns the unique id for the passed in function or assigns a new id to the given function and returns the newly assigned id
   * @param func the function for which the unique id should be determined
   * @returns  the id of this function
   */
  public getOrSetId(func: Function | IFunctionId): IFunctionId {
    if (isFunctionId(func)) {
      return func;
    }

    const source = func.toString();
    let identifier = this.ids.get(source);

    if (typeof identifier === "undefined") {
      identifier = functionId("dynamic", ++this.lastId);
      this.initDefinition(func, identifier);
    }

    return identifier;
  }

  /**
   * Returns the definition of the function with the given id or undefined, if the id is not assigned to any function definition
   * @param id the id of the function to resolve
   * @returns the resolved function definition or undefined
   * @throws if the function is a static function and therefore no definition exists.
   */
  public getDefinition(id: IFunctionId): IFunctionDefinition | undefined {
    return this.definitions.get(id.identifier);
  }

  private initDefinition(func: Function, id: IFunctionId) {
    const source = func.toString();
    const name = getFunctionName(func);
    const args = source.substring(source.indexOf("(") + 1, source.indexOf(")")).split(",");
    const body = source.substring(source.indexOf("{") + 1, source.lastIndexOf("}")).trim();

    const definition = {
      argumentNames: args.map(arg => arg.trim()),
      body,
      id,
      name: name ? name : undefined
    };

    this.ids.set(source, id);
    this.definitions.set(id.identifier, definition);
  }
}
