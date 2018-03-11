import { toIterator, toArray, flattenArray, concatInPlace } from "../../../src/common/util/arrays";

describe("arrays", function() {
  describe("toIterator", function() {
    it("returns an iterator with a next method", function() {
      // arrange
      const iterator = toIterator([1, 2]);

      // assert
      expect(typeof iterator.next).toBe("function");
    });

    it("next returns done=true for the first and any succeeding calls if the array contains no elements", function() {
      // arrange
      const iterator = toIterator([]);

      // assert
      expect(iterator.next().done).toBe(true);
      expect(iterator.next().done).toBe(true);
      expect(iterator.next().done).toBe(true);
    });

    it("next returns the value and done=false for if the iterator has not reached the end", function() {
      // arrange
      const iterator = toIterator([1, 2, 3]);

      // assert
      const first = iterator.next();
      const second = iterator.next();
      const third = iterator.next();

      expect(first.done).toBe(false);
      expect(first.value).toBe(1);
      expect(second.done).toBe(false);
      expect(second.value).toBe(2);
      expect(third.done).toBe(false);
      expect(third.value).toBe(3);
    });

    it("returns done=true if the iterator has reached the end", function() {
      // arrange
      const iterator = toIterator([1, 2]);

      iterator.next();
      iterator.next();

      // assert
      const result = iterator.next();
      expect(result.done).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });

  describe("toArray", function() {
    it("converts an empty iterator to an empty array", function() {
      // arrange
      const iterator = {
        next() {
          return { done: true } as IteratorResult<number>;
        }
      };

      // assert
      expect(toArray(iterator)).toEqual([]);
    });

    it("converts a non empty iterator to an array containing the elements in the same order", function() {
      // arrange
      let i = 0;
      const iterator: Iterator<number> = {
        next() {
          if (++i < 4) {
            return { done: false, value: i };
          }
          return { done: true } as IteratorResult<number>;
        }
      };

      // assert
      expect(toArray(iterator)).toEqual([1, 2, 3]);
    });
  });

  describe("flattenArray", function() {
    it("returns an empty array for an empty array", function() {
      expect(flattenArray([])).toEqual([]);
    });

    it("returns the the content of the first sub array if the array has length 1", function() {
      expect(flattenArray([[1, 2]])).toEqual([1, 2]);
    });

    it("returns the sub arrays concatenated", function() {
      expect(flattenArray([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
  });

  describe("concatInPlace", function() {
    it("returns an empty array if two empty arrays are concatenated", function() {
      // arrange
      const target: number[] = [];

      // act
      concatInPlace(target, []);

      // assert
      expect(target).toEqual([]);
    });

    it("inserts the elements of the second array into the first", function() {
      // arrange
      const target = [1, 2];

      // act
      concatInPlace(target, [3, 4, 5]);

      // assert
      expect(target).toEqual([1, 2, 3, 4, 5]);
    });
  });
});
