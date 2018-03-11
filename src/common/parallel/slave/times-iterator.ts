import { IParallelTaskEnvironment } from "../";
/**
 * Generator that creates an iterator containing end - start elements that are created by calling the iteratee
 * @param start the start value (inclusive)
 * @param end end value (exclusive)
 * @param iteratee that is to be called to create the elements
 * @param env the environment of the job
 * @param TResult type of the created elements by the iteratee
 * @returns iterator for the created elements
 */
export function timesIterator<TResult>(
  start: number,
  end: number,
  iteratee: (this: void, i: number, env: IParallelTaskEnvironment) => TResult,
  env: IParallelTaskEnvironment
): Iterator<TResult> {
  let next = start;
  return {
    next(): IteratorResult<TResult> {
      const current = next;
      next = current + 1;
      if (current < end) {
        return { done: false, value: iteratee(current, env) };
      }
      return { done: true } as IteratorResult<TResult>;
    }
  };
}
