import { toArray } from "../../../../src/common/util/arrays";
import { timesIterator } from "../../../../src/common/parallel/slave/times-iterator";
import { IParallelTaskEnvironment } from "../../../../src/common/parallel";

describe("timesIterator", function() {
  let environment: IParallelTaskEnvironment;

  beforeEach(function() {
    environment = { taskIndex: 2, valuesPerTask: 2 };
  });

  it("returns an iterator that generates the elements using the generator function", function() {
    // arrange
    const generatorSpy = jasmine.createSpy("generator");
    const iterator = timesIterator(5, 10, generatorSpy, environment);

    // act
    toArray(iterator);

    // assert
    expect(generatorSpy).toHaveBeenCalledTimes(5);
  });

  it("returns an iterator containing the elements created by the generator", function() {
    // arrange
    const iterator = timesIterator(5, 10, n => n * 2, environment);

    // act, assert
    expect(toArray(iterator)).toEqual([10, 12, 14, 16, 18]);
  });
});
