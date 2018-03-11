import { mapIterator } from "../../../../src/common/parallel/slave/map-iterator";
import { toIterator, toArray } from "../../../../src/common/util/arrays";
import { IParallelTaskEnvironment } from "../../../../src/common/parallel";

describe("mapIterator", function() {
  let environment: IParallelTaskEnvironment;

  beforeEach(function() {
    environment = { taskIndex: 2, valuesPerTask: 2 };
  });

  it("returns an iterator that has mapped all values using the passed iteratee", function() {
    // arrange
    const iterator = toIterator([1, 2, 3, 4]);
    const iteratee = (n: any) => n * 2;

    // act
    const result = mapIterator(iterator, iteratee, environment);

    // assert
    expect(toArray(result)).toEqual([2, 4, 6, 8]);
  });
});
