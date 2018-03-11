import { validateOptions } from "../../../src/common/parallel/parallel-options";
describe("validateOptions", function() {
  it("does not throw for valid options", function() {
    validateOptions({
      maxDegreeOfParallelism: 1,
      maxValuesPerTask: 4,
      minValuesPerTask: 2
    });
  });

  it("throws if minValuesPerTask is less than maxValuesPerTask", function() {
    expect(() =>
      validateOptions({
        maxValuesPerTask: 2,
        minValuesPerTask: 4
      })
    ).toThrowError("Illegal parallel options: minValuesPerTask (4) must be equal or less than maxValuesPerTask (2).");
  });

  for (const option of ["maxDegreeOfParallelism", "maxValuesPerTask", "minValuesPerTask"]) {
    it(`throws if ${option} is not a number`, function() {
      expect(() =>
        validateOptions({
          [option]: "2"
        })
      ).toThrowError(`Illegal parallel options: ${option} (2) has to be an integer greater than zero`);
    });

    it(`throws if ${option} is not an integer`, function() {
      expect(() =>
        validateOptions({
          [option]: 0.4
        })
      ).toThrowError(`Illegal parallel options: ${option} (0.4) has to be an integer greater than zero`);
    });

    it(`throws if ${option} is zero`, function() {
      expect(() =>
        validateOptions({
          [option]: 0
        })
      ).toThrowError(`Illegal parallel options: ${option} (0) has to be an integer greater than zero`);
    });

    it(`throws if ${option} is negative`, function() {
      expect(() =>
        validateOptions({
          [option]: -3
        })
      ).toThrowError(`Illegal parallel options: ${option} (-3) has to be an integer greater than zero`);
    });
  }
});
