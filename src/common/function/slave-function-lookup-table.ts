import { IFunctionLookupTable } from "./function-lookup-table";
import { IFunctionDefinition } from "./function-defintion";
import { IFunctionId } from "./function-id";
import { SimpleMap } from "../util/simple-map";

/**
 * Cache used by each worker slave to cache the received functions.
 * Caching the functions has the advantage that function only is serialized, transmitted and deserialized once. This also
 * has the advantage, that the function instance stays the same and therefore can be optimized by the runtime system.
 */
export class SlaveFunctionLookupTable implements IFunctionLookupTable {
  private cache = new SimpleMap<string, Function>();

  /**
   * Resolves the function with the given id
   * @param id the id of the function to resolve
   * @returns the resolved function or undefined if not known
   */
  public getFunction(id: IFunctionId): Function | undefined {
    return this.cache.get(id.identifier);
  }

  /**
   * Registers a new function in the cache
   * @param definition the definition of the function to register
   * @returns the registered function
   */
  public registerFunction(definition: IFunctionDefinition): Function {
    const f = this.toFunction(definition);
    this.cache.set(definition.id.identifier, f);
    return f;
  }

  public registerStaticFunction(id: IFunctionId, func: Function): void {
    if (this.has(id)) {
      throw new Error(
        `The given function id '${
          id.identifier
        }' is already used by another function registration, the id needs to be unique.`
      );
    }
    this.cache.set(id.identifier, func);
  }

  /**
   * Tests if the cache contains a function with the given id
   * @param id the id of the function to test for existence
   * @returns true if the cache contains a function with the given id
   */
  public has(id: IFunctionId) {
    return this.cache.has(id.identifier);
  }

  private toFunction(definition: IFunctionDefinition): Function {
    if (definition.name) {
      const args = definition.argumentNames.join(", ");
      const wrapper = Function.apply(undefined, [
        `return function ${definition.name} (${args}) { ${definition.body} }; `
      ]);
      return wrapper();
    }
    return Function.apply(undefined, [...definition.argumentNames, definition.body]);
  }
}
