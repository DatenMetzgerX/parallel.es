/**
 * Generator function that creates an iterator containing all elements in the range [start, end) with a step size of step.
 * @param start start value of the range (inclusive)
 * @param end end value of the range (exclusive)
 * @param step step size between two values
 * @returns iterator with the values [start, end)
 */
export function rangeIterator(start: number, end: number, step: number): Iterator<number> {
  const distance = end - start;
  let length = Math.max(Math.floor(distance / (step || 1)), 0);
  let next = start;

  return {
    next(): IteratorResult<number> {
      const current = next;
      next = next + step;
      if (length-- !== 0) {
        return { done: false, value: current };
      }
      return { done: true } as IteratorResult<number>;
    }
  };
}
