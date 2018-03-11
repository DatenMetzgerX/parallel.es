/**
 * Creates an iterator that iterates over the given array
 * @param data the array
 * @param T element type
 * @returns the iterator
 */
export function toIterator<T>(data: T[]): Iterator<T> {
  return data[Symbol.iterator]();
}

/**
 * Converts the given iterator to an array
 * @param iterator the iterator that is to be converted into an array
 * @param T element type
 * @returns {T[]} the array representation of the given iterator
 */
export function toArray<T>(iterator: Iterator<T>): T[] {
  const result: T[] = [];
  let current: IteratorResult<T>;
  /* tslint:disable:no-conditional-assignment */
  while (!(current = iterator.next()).done) {
    result.push(current.value as T);
  }
  return result;
}

/**
 * Flattens the given array.
 * @param deepArray the array to flatten
 * @param type of the array elements
 * @returns returns an array containing all the values contained in the sub arrays of deep array.
 */
export function flattenArray<T>(deepArray: T[][]): T[] {
  if (deepArray.length === 0) {
    return [];
  }

  const [head, ...tail] = deepArray;
  return Array.prototype.concat.apply(head, tail);
}

/**
 * Appends the toAppend array to the target array. The result is stored in the target array (therefore, in place)
 * @param target the first element to concat and as well as the target of the concatenation operation
 * @param toAppend the array to append to target
 */
export function concatInPlace<T>(target: T[], toAppend: T[]): T[] {
  const insertionIndex = target.length;
  target.length += toAppend.length;

  for (let i = 0; i < toAppend.length; ++i) {
    target[insertionIndex + i] = toAppend[i];
  }

  return target;
}
