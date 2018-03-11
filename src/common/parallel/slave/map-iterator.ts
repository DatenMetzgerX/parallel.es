import { IParallelTaskEnvironment } from "../";
/**
 * Performs the map operation
 * @param iterator the iterator of the previous step
 * @param iteratee the iteratee to apply to each element in the iterator
 * @param env the environment of the job
 * @param T the type of the input elements
 * @param TResult the type of the returned element of the iteratee
 * @returns a new iterator where each element has been mapped using the iteratee
 */
export function mapIterator<T, TResult>(
  iterator: Iterator<T>,
  iteratee: (this: void, value: T, env: IParallelTaskEnvironment) => TResult,
  env: IParallelTaskEnvironment
): Iterator<TResult> {
  return {
    next(): IteratorResult<TResult> {
      const result = iterator.next();
      if (result.done) {
        return { done: true } as IteratorResult<TResult>;
      }
      return {
        done: result.done,
        value: iteratee(result.value, env)
      };
    }
  };
}
