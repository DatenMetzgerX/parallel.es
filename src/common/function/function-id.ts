/**
 * @module parallel
 */
/** */

/**
 * Identifier for a serialized function
 */
export interface IFunctionId {
  /**
   * The globally unique identifier
   */
  identifier: string;

  /**
   * Flag that indicates that this is a function id
   */
  _______isFunctionId: boolean;
}

/**
 * Creates a function id
 * @param namespace the namespace of the id
 * @param id the unique id for this namespace
 * @returns the function id
 */
export function functionId(namespace: string, id: number): IFunctionId {
  return {
    _______isFunctionId: true,
    identifier: `${namespace}-${id}`
  };
}

/**
 * Tests if the given object is a function id
 * @param obj the object to test for
 * @returns true if the object is  a function id
 */
export function isFunctionId(obj: any): obj is IFunctionId {
  return !!obj && obj._______isFunctionId === true;
}
