import { toArray } from "../../../../src/common/util/arrays";
import { rangeIterator } from "../../../../src/common/parallel/slave/range-iterator";

describe("rangeIterator", function() {
  it("returns an iterator containing the elements from start up to end (exclusive) increasing by step", function() {
    // arrange
    const iterator = rangeIterator(10, 20, 2);

    // act, assert
    expect(toArray(iterator)).toEqual([10, 12, 14, 16, 18]);
  });

  it("returns an iterator containing the elements from start up to end (exclusive) using a negative step size", function() {
    // arrange
    const iterator = rangeIterator(-10, -21, -2);

    // act, assert
    expect(toArray(iterator)).toEqual([-10, -12, -14, -16, -18]);
  });

  it("returns an iterator containing the elements from start up to end (exclusive) if the step size is fractional", function() {
    // arrange
    const iterator = rangeIterator(0, 1, 0.1);

    // act, assert
    expect(toArray(iterator)).toEqual([
      0,
      0.1,
      0.2,
      0.30000000000000004,
      0.4,
      0.5,
      0.6,
      0.7,
      0.7999999999999999,
      0.8999999999999999
    ]);
  });

  it("returns an empty iterator if step size is negative and end is larger than start", function() {
    // arrange
    const iterator = rangeIterator(10, 15, -1);

    // act, assert
    expect(toArray(iterator)).toEqual([]);
  });
});
