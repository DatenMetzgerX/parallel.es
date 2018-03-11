import { toIterator, toArray } from "../../../../src/common/util/arrays";
import { filterIterator } from "../../../../src/common/parallel/slave/filter-iterator";
import { IParallelTaskEnvironment } from "../../../../src/common/parallel";

describe("filterIterator", function() {
  let environment: IParallelTaskEnvironment;

  beforeEach(function() {
    environment = { taskIndex: 2, valuesPerTask: 2 };
  });

  it("returns an iterator only containing the elements where the predicate returned true", function() {
    // arrange
    const predicate = jasmine.createSpy("predicate").and.returnValues(true, true, false, true);
    const iterator = toIterator([1, 2, 3, 4]);

    // act
    const filtered = filterIterator(iterator, predicate, environment);

    // assert
    expect(toArray(filtered)).toEqual([1, 2, 4]);
  });
});
