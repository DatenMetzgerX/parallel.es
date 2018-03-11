import { IParallel } from "../../../src/common/parallel";
import { parallelFactory } from "../../../src/common/parallel/parallel-impl";
import { ParallelTimesGenerator } from "../../../src/common/parallel/generator/parallel-times-generator";
import { ParallelRangeGenerator } from "../../../src/common/parallel/generator/parallel-range-generator";
import { ParallelCollectionGenerator } from "../../../src/common/parallel/generator/parallel-collection-generator";
import { parallelChainFactory } from "../../../src/common/parallel/chain/parallel-chain-factory";
import { IDefaultInitializedParallelOptions } from "../../../src/common/parallel";
import { IThreadPool } from "../../../src/common/thread-pool/thread-pool";
import { FunctionCall } from "../../../src/common/function/function-call";
import { functionId } from "../../../src/common/function/function-id";
import { FunctionCallSerializer } from "../../../src/common/function/function-call-serializer";
import { ISerializedFunctionCall } from "../../../src/common/function/serialized-function-call";

describe("Parallel", function() {
  let parallel: IParallel;
  let threadPool: IThreadPool;
  let threadPoolRunSpy: jasmine.Spy;

  let functionCallSerializer: FunctionCallSerializer;
  let serializeFunctionCallSpy: jasmine.Spy;

  let createParallelChainSpy: jasmine.Spy;
  let options: IDefaultInitializedParallelOptions;

  beforeEach(function() {
    createParallelChainSpy = spyOn(parallelChainFactory, "create");
    threadPoolRunSpy = jasmine.createSpy("run");
    threadPool = { run: threadPoolRunSpy } as any;

    functionCallSerializer = new FunctionCallSerializer(undefined as any);
    serializeFunctionCallSpy = spyOn(functionCallSerializer, "serializeFunctionCall");

    options = {
      functionCallSerializer,
      scheduler: undefined as any,
      threadPool
    };
    parallel = parallelFactory(options);
  });

  describe("defaultOptions", function() {
    it("returns the default configuration", function() {
      // act
      const defaultOptions = parallel.defaultOptions();

      // assert
      expect(defaultOptions).toBeDefined();
    });

    it("initializes the thread pool to the thread pool from the configuration by default", function() {
      // act
      const defaultOptions = parallel.defaultOptions();

      // assert
      expect(defaultOptions.threadPool).toBe(threadPool);
    });

    it("applies the user options as new default options", function() {
      // act
      parallel.defaultOptions({
        minValuesPerTask: 1000
      });

      // assert
      const defaultOptions = parallel.defaultOptions();

      expect(defaultOptions.minValuesPerTask).toBe(1000);
    });

    it("merges the given options with the existing options", function() {
      // act
      parallel.defaultOptions({
        minValuesPerTask: 1000
      });

      // assert
      const defaultOptions = parallel.defaultOptions();
      expect(defaultOptions.threadPool).toBe(threadPool);
    });

    it("unsets values if undefined is passed as option value", function() {
      // arrange
      parallel.defaultOptions({
        minValuesPerTask: 1000
      });

      // act
      parallel.defaultOptions({
        minValuesPerTask: undefined
      });

      // assert
      const defaultOptions = parallel.defaultOptions();
      expect(defaultOptions.minValuesPerTask).toBeUndefined();
    });

    it("throws if the thread pool is set to undefined", function() {
      // act, assert
      expect(() => parallel.defaultOptions({ threadPool: undefined } as any)).toThrowError(
        "The thread pool is mandatory and cannot be unset"
      );
    });

    it("throws if the functionCallSerializer is set to undefined", function() {
      // act, assert
      expect(() => parallel.defaultOptions({ functionCallSerializer: undefined } as any)).toThrowError(
        "The function call serializer is mandatory and cannot be unset"
      );
    });
  });

  describe("from", function() {
    it("creates a chain with a parallel collection generator over the passed in array", function() {
      // arrange
      const data = [1, 2, 3, 4, 5];

      // act
      parallel.from(data);

      // assert
      expect(createParallelChainSpy).toHaveBeenCalledWith(jasmine.any(ParallelCollectionGenerator), options);
      expect((createParallelChainSpy.calls.argsFor(0)[0] as ParallelCollectionGenerator<number>).collection).toEqual(
        data
      );
    });

    it("merges the options with the default options", function() {
      parallel.from([1, 2, 3, 4], { maxValuesPerTask: 2 });

      expect(createParallelChainSpy).toHaveBeenCalledWith(jasmine.any(ParallelCollectionGenerator), {
        functionCallSerializer,
        maxValuesPerTask: 2,
        scheduler: undefined,
        threadPool
      });
    });
  });

  describe("range", function() {
    it("creates a new parallel chain with a range generator", function() {
      // act
      parallel.range(0, 10, 1);

      // assert
      expect(createParallelChainSpy).toHaveBeenCalledWith(jasmine.any(ParallelRangeGenerator), options);
      const generator = createParallelChainSpy.calls.argsFor(0)[0] as ParallelRangeGenerator;
      expect(generator.start).toBe(0);
      expect(generator.end).toBe(10);
      expect(generator.step).toBe(1);
    });

    it("merges the options with the default options", function() {
      parallel.range(0, 10, 1, { maxValuesPerTask: 2 });

      expect(createParallelChainSpy).toHaveBeenCalledWith(jasmine.any(ParallelRangeGenerator), {
        functionCallSerializer,
        maxValuesPerTask: 2,
        scheduler: undefined,
        threadPool
      });
    });
  });

  describe("times", function() {
    it("creates a chain with a times generator", function() {
      // arrange
      const generatorFunc = (n: number) => n;

      // act
      parallel.times(10, generatorFunc);

      // assert
      expect(createParallelChainSpy).toHaveBeenCalledWith(jasmine.any(ParallelTimesGenerator), options);
      const generator = createParallelChainSpy.calls.argsFor(0)[0] as ParallelTimesGenerator;
      expect(generator.times).toBe(10);
      expect(generator.iteratee).toEqual(FunctionCall.createUnchecked(generatorFunc));
    });

    it("merges the options with the default options", function() {
      parallel.times(2, () => 3, {}, { maxValuesPerTask: 2 });

      expect(createParallelChainSpy).toHaveBeenCalledWith(
        jasmine.any(ParallelTimesGenerator),
        {
          functionCallSerializer,
          maxValuesPerTask: 2,
          scheduler: undefined,
          threadPool
        },
        {}
      );
    });
  });

  describe("run", function() {
    it("creates a task with main set to the serialized form of the given function", function() {
      // arrange
      const serializedFunctionCall: ISerializedFunctionCall = {
        ______serializedFunctionCall: true,
        functionId: {
          _______isFunctionId: true,
          identifier: "test-1"
        },
        parameters: [{ test: 123 }]
      };
      serializeFunctionCallSpy.and.returnValue(serializedFunctionCall);

      const func = jasmine.createSpy("func");

      // act
      parallel.run(func, { test: 123 });

      // assert
      expect(threadPoolRunSpy).toHaveBeenCalledWith({
        main: serializedFunctionCall,
        usedFunctionIds: [serializedFunctionCall.functionId]
      });
    });

    it("runs the function with the given id on the thread pool", function() {
      // arrange
      const funcId = functionId("test", 0);
      const serializedFunctionCall: ISerializedFunctionCall = {
        ______serializedFunctionCall: true,
        functionId: funcId,
        parameters: [{ test: 123 }]
      };
      serializeFunctionCallSpy.and.returnValue(serializedFunctionCall);

      // act
      parallel.run(funcId, { test: 123 });

      // assert
      expect(threadPoolRunSpy).toHaveBeenCalledWith({
        main: serializedFunctionCall,
        usedFunctionIds: [serializedFunctionCall.functionId]
      });
    });
  });
});
