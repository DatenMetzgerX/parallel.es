import { ParallelCollectionGenerator } from "../../../../src/common/parallel/generator/parallel-collection-generator";
import { FunctionCallSerializer } from "../../../../src/common/function/function-call-serializer";
import { DynamicFunctionRegistry } from "../../../../src/common/function/dynamic-function-registry";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { IFunctionId } from "../../../../src/common/function/function-id";

describe("ParallelCollectionGenerator", function() {
  let functionCallSerializer: FunctionCallSerializer;
  let getOrSetIdSpy: jasmine.Spy;

  beforeEach(function() {
    getOrSetIdSpy = jasmine.createSpy("functionRegistry.getOrSetId");
    const functionRegistry: DynamicFunctionRegistry = {
      getOrSetId: getOrSetIdSpy
    } as any;

    functionCallSerializer = new FunctionCallSerializer(functionRegistry);
  });

  describe("length", function() {
    it("returns 0 for an empty array", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([]);

      // act, assert
      expect(generator.length).toBe(0);
    });

    it("returns the length of the array", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([1, 2, 3]);

      // act, assert
      expect(generator.length).toBe(3);
    });
  });

  describe("serializeSlice", function() {
    it("returns a serialized toIterator function call", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const id: IFunctionId = { identifier: "1000", _______isFunctionId: true };
      getOrSetIdSpy.and.returnValue(id);

      // act
      const slice = generator.serializeSlice(0, 4, functionCallSerializer);

      // assert
      expect(slice.functionId).toBe(id);
      expect(getOrSetIdSpy).toHaveBeenCalledWith(ParallelWorkerFunctionIds.TO_ITERATOR);
    });

    it("passes a slice of the array as parameter", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      getOrSetIdSpy.and.returnValue(1000);

      // act
      const slice = generator.serializeSlice(0, 3, functionCallSerializer);

      // assert
      expect(slice.parameters).toEqual([[0, 1, 2]]);
    });

    it("passes a sub slice not starting at the end of the array", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      getOrSetIdSpy.and.returnValue(1000);

      // act
      const slice = generator.serializeSlice(1, 3, functionCallSerializer);

      // assert
      expect(slice.parameters).toEqual([[3, 4, 5]]);
    });

    it("reduces the slice size if it goes over the end of the array", function() {
      // arrange
      const generator = new ParallelCollectionGenerator([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      getOrSetIdSpy.and.returnValue(1000);

      // act
      const slice = generator.serializeSlice(3, 3, functionCallSerializer);

      // assert
      expect(slice.parameters).toEqual([[9]]);
    });
  });
});
