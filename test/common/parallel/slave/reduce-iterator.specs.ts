import { reduceIterator } from "../../../../src/common/parallel/slave/reduce-iterator";
import { toIterator } from "../../../../src/common/util/arrays";
import { IParallelTaskEnvironment } from "../../../../src/common/parallel";

describe("reduceIterator", function() {
  let environment: IParallelTaskEnvironment;

  beforeEach(function() {
    environment = { taskIndex: 2, valuesPerTask: 2 };
  });

  it("returns the default value if the passed iterator is empty", function() {
    // arrange
    const iterator = toIterator([]);

    // act
    const result = reduceIterator(100, iterator, (memo, value) => memo + value, environment).next().value;

    // assert
    expect(result).toBe(100);
  });

  it("applies the accumulator for each value of the passed iterator", function() {
    // arrange
    const iterator = toIterator([1, 2, 3, 4]);
    const accumulator = jasmine.createSpy("accumulator");
    accumulator.and.callFake((memo: number, value: number) => memo + value);

    // act
    reduceIterator(0, iterator, accumulator, environment).next();

    // assert
    expect(accumulator).toHaveBeenCalledWith(0, 1, environment);
    expect(accumulator).toHaveBeenCalledWith(1, 2, environment);
    expect(accumulator).toHaveBeenCalledWith(3, 3, environment);
    expect(accumulator).toHaveBeenCalledWith(6, 4, environment);
  });

  it("returns the accumulated value", function() {
    // arrange
    const iterator = toIterator([1, 2, 3, 4]);
    const accumulator = (memo: number, value: number) => memo + value;

    // act
    const result = reduceIterator(0, iterator, accumulator, environment).next().value;

    // assert
    expect(result).toBe(10);
  });
});
