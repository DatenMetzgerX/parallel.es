import { IParallelTaskEnvironment } from "../";
/**
 * Returns a new iterator that only contains all elements for which the given predicate returns true
 * @param iterator the iterator to filter
 * @param predicate the predicate to use for filtering the elements
 * @param env the environment of the job
 * @param T type of the elements to filter
 * @returns an iterator only containing the elements where the predicate is true
 */
export function filterIterator<T>(
  iterator: Iterator<T>,
  predicate: (this: void, value: T, env: IParallelTaskEnvironment) => boolean,
  env: IParallelTaskEnvironment
): Iterator<T> {
  return {
    next() {
      let current: IteratorResult<T>;
      /* tslint:disable:no-conditional-assignment */
      while (!(current = iterator.next()).done) {
        if (predicate(current.value, env)) {
          return current;
        }
      }

      return current;
    }
  };
}
