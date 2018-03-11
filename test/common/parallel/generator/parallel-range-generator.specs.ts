import { FunctionCallSerializer } from "../../../../src/common/function/function-call-serializer";
import { DynamicFunctionRegistry } from "../../../../src/common/function/dynamic-function-registry";
import { ParallelRangeGenerator } from "../../../../src/common/parallel/generator/parallel-range-generator";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { IFunctionId } from "../../../../src/common/function/function-id";

describe("ParallelRangeGenerator", function() {
  let functionCallSerializer: FunctionCallSerializer;
  let getOrSetIdSpy: jasmine.Spy;

  beforeEach(function() {
    getOrSetIdSpy = jasmine.createSpy("functionRegistry.getOrSetId");
    const functionRegistry: DynamicFunctionRegistry = {
      getOrSetId: getOrSetIdSpy
    } as any;

    functionCallSerializer = new FunctionCallSerializer(functionRegistry);
  });

  describe("create", function() {
    it("initializes the start with 0 and step with 1, if the function is called with a single, positive value", function() {
      // act
      const generator = ParallelRangeGenerator.create(10);

      // assert
      expect(generator.start).toBe(0);
      expect(generator.end).toBe(10);
      expect(generator.step).toBe(1);
    });

    it("initializes the start with 0 and step with -1, if the function is called with a single, negative value", function() {
      // act
      const generator = ParallelRangeGenerator.create(-10);

      // assert
      expect(generator.start).toBe(0);
      expect(generator.end).toBe(-10);
      expect(generator.step).toBe(-1);
    });

    it("initializes step with 1, if the function is called with two values and start is less then end", function() {
      // act
      const generator = ParallelRangeGenerator.create(1, 10);

      // assert
      expect(generator.start).toBe(1);
      expect(generator.end).toBe(10);
      expect(generator.step).toBe(1);
    });

    it("initializes step with -1, if the function is called with two arguments and start is larger then end", function() {
      // act
      const generator = ParallelRangeGenerator.create(10, 1);

      // assert
      expect(generator.start).toBe(10);
      expect(generator.end).toBe(1);
      expect(generator.step).toBe(-1);
    });

    it("throws if the step size is 0", function() {
      // act
      expect(() => ParallelRangeGenerator.create(1, 10, 0)).toThrowError("Step size of zero is not allowed");
    });
  });

  describe("length", function() {
    it("returns 0 for an empty range", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 0, 1);

      // act, assert
      expect(generator.length).toBe(0);
    });

    it("returns the number of elements in the range", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 10, 1);

      // act, assert
      expect(generator.length).toBe(10);
    });

    it("rounds the length up if it is not divisible by the step size (the first element is always included)", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 10, 3);

      // act, assert
      expect(generator.length).toBe(4);
    });
  });

  describe("serializeSlice", function() {
    it("serializes the range functions", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 10, 1);
      const id: IFunctionId = { identifier: "1", _______isFunctionId: true };
      getOrSetIdSpy.and.returnValue(id);

      // act
      const func = generator.serializeSlice(0, 3, functionCallSerializer);

      // assert
      expect(func.functionId).toBe(id);
      expect(getOrSetIdSpy).toHaveBeenCalledWith(ParallelWorkerFunctionIds.RANGE);
    });

    it("passes the start, end and step of the current slice as parameters", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 10, 1);
      getOrSetIdSpy.and.returnValue(1);

      // act
      const func = generator.serializeSlice(1, 3, functionCallSerializer);

      // assert
      expect(func.parameters).toEqual([3 /* start */, 6 /* end */, 1 /* step */]);
    });

    it("sets the slice end to end if it is the last slice and adding the full slice sice would exceed the limit", function() {
      // arrange
      const generator = ParallelRangeGenerator.create(0, 10, 1);
      getOrSetIdSpy.and.returnValue(1);

      // act
      const func = generator.serializeSlice(2, 4, functionCallSerializer);

      // assert
      expect(func.parameters).toEqual([8 /* start */, 10 /* end */, 1 /* step */]);
    });
  });
});
