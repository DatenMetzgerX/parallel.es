import { IDefaultInitializedParallelOptions } from "../../../../src/common/parallel/parallel-options";
import { IThreadPool } from "../../../../src/common/thread-pool/thread-pool";
import { FunctionCallSerializer } from "../../../../src/common/function/function-call-serializer";
import { ISerializedFunctionCall } from "../../../../src/common/function/serialized-function-call";
import {
  AbstractParallelScheduler,
  IParallelTaskScheduling
} from "../../../../src/common/parallel/scheduling/abstract-parallel-scheduler";
import { FunctionCall } from "../../../../src/common/function/function-call";
import { IParallelGenerator } from "../../../../src/common/parallel/generator/parallel-generator";
import { ParallelCollectionGenerator } from "../../../../src/common/parallel/generator/parallel-collection-generator";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { functionId } from "../../../../src/common/function/function-id";
import { ParallelEnvironmentDefinition } from "../../../../src/common/parallel/parallel-environment-definition";
import { ITask } from "../../../../src/common/task/task";

describe("AbstractParallelScheduler", function() {
  let options: IDefaultInitializedParallelOptions;
  let generator: IParallelGenerator;

  let functionSerializer: FunctionCallSerializer;
  let serializeFunctionCallSpy: jasmine.Spy;

  let threadPoolRunSpy: jasmine.Spy;
  let threadPool: IThreadPool;
  let scheduler: AbstractParallelScheduler;
  let getSchedulingSpy: jasmine.Spy;

  beforeEach(function() {
    scheduler = new SimpleScheduler();
    getSchedulingSpy = spyOn(scheduler, "getScheduling");

    functionSerializer = new FunctionCallSerializer(undefined as any);
    serializeFunctionCallSpy = spyOn(functionSerializer, "serializeFunctionCall");

    threadPoolRunSpy = jasmine.createSpy("scheduleTask");
    threadPool = {
      maxThreads: 2,
      run: threadPoolRunSpy
    };

    options = {
      functionCallSerializer: functionSerializer,
      scheduler,
      threadPool
    };

    generator = new ParallelCollectionGenerator([1, 2, 3, 4, 5]);
  });

  describe("schedule", function() {
    it("schedules the tasks on the thread pool", function() {
      // arrange
      getSchedulingSpy.and.returnValue({ numberOfTasks: 2, valuesPerTask: 3 });

      const task1: ITask<{}> = new Promise(() => ({})) as any;
      const task2: ITask<{}> = new Promise(() => ({})) as any;

      threadPoolRunSpy.and.returnValues(task1, task2);

      spyOn(generator, "serializeSlice").and.returnValue({ functionId: 2 });

      // act
      const tasks = scheduler.schedule({
        environment: ParallelEnvironmentDefinition.of(),
        generator,
        operations: [],
        options
      });

      // assert
      expect(threadPoolRunSpy).toHaveBeenCalledTimes(2);
      expect(tasks).toEqual([task1, task2]);
    });

    it("calls the generator.serializeSlice for each task to spawn", function() {
      // arrange
      getSchedulingSpy.and.returnValue({ numberOfTasks: 2, valuesPerTask: 3 });

      const task1 = new Promise(() => undefined);
      const task2 = new Promise(() => undefined);

      threadPoolRunSpy.and.returnValues(task1, task2);

      const serializeSliceSpy = spyOn(generator, "serializeSlice").and.returnValue({ functionId: 2 });

      // act
      scheduler.schedule({
        environment: ParallelEnvironmentDefinition.of(),
        generator,
        operations: [],
        options
      });

      // assert
      expect(serializeSliceSpy).toHaveBeenCalledWith(0, 3, functionSerializer);
      expect(serializeSliceSpy).toHaveBeenCalledWith(1, 3, functionSerializer);
    });

    it("passes the serialized environment to the main function", function() {
      // arrange
      getSchedulingSpy.and.returnValue({ numberOfTasks: 1, valuesPerTask: 3 });
      spyOn(generator, "serializeSlice").and.returnValue({ functionId: 2 });

      // act
      scheduler.schedule({
        environment: ParallelEnvironmentDefinition.of({ test: 10 }),
        generator,
        operations: [],
        options
      });

      // assert
      expect(serializeFunctionCallSpy).toHaveBeenCalledWith(
        FunctionCall.create(ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR, {
          environments: [{ test: 10 }],
          generator: { functionId: 2 },
          operations: [],
          taskIndex: 0,
          valuesPerTask: 3
        })
      );
    });

    it("schedules a task for each slice according to the job", function() {
      // arrange
      getSchedulingSpy.and.returnValue({ numberOfTasks: 2, valuesPerTask: 3 });

      const powerOf = (value: number) => value ** 2;

      serializeFunctionCallSpy.and.callFake((call: FunctionCall): ISerializedFunctionCall => {
        if (call.func === ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR) {
          return {
            ______serializedFunctionCall: true,
            functionId: ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR,
            parameters: call.params
          };
        }
        if (call.func === ParallelWorkerFunctionIds.MAP) {
          return {
            ______serializedFunctionCall: true,
            functionId: ParallelWorkerFunctionIds.MAP,
            parameters: call.params
          };
        }
        if (call.func === powerOf) {
          return { ______serializedFunctionCall: true, functionId: functionId("test", 0), parameters: call.params };
        }
        throw new Error("Unknown function call" + JSON.stringify(call));
      });

      const task1 = new Promise(() => undefined);
      const task2 = new Promise(() => undefined);

      threadPoolRunSpy.and.returnValues(task1, task2);

      const generatorSlice1 = {
        ______serializedFunctionCall: true,
        functionId: ParallelWorkerFunctionIds.TO_ITERATOR,
        parameters: [[1, 2, 3]]
      };
      const generatorSlice2 = {
        ______serializedFunctionCall: true,
        functionId: ParallelWorkerFunctionIds.TO_ITERATOR,
        parameters: [[4, 5]]
      };
      spyOn(generator, "serializeSlice").and.returnValues(generatorSlice1, generatorSlice2);

      // act
      scheduler.schedule({
        environment: ParallelEnvironmentDefinition.of(),
        generator,
        operations: [
          {
            iteratee: FunctionCall.createUnchecked(powerOf),
            iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
          }
        ],
        options
      });

      // assert
      // slice 1
      expect(threadPoolRunSpy).toHaveBeenCalledWith({
        main: {
          ______serializedFunctionCall: true,
          functionId: ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR, // process
          parameters: [
            {
              environments: [],
              generator: generatorSlice1,
              operations: [
                {
                  iteratee: { ______serializedFunctionCall: true, functionId: functionId("test", 0), parameters: [] }, // powerOf
                  iterator: {
                    ______serializedFunctionCall: true,
                    functionId: ParallelWorkerFunctionIds.MAP,
                    parameters: []
                  } // map
                }
              ],
              taskIndex: 0,
              valuesPerTask: 3
            }
          ]
        },
        taskIndex: 0,
        usedFunctionIds: jasmine.arrayContaining([
          ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR,
          ParallelWorkerFunctionIds.MAP,
          functionId("test", 0),
          ParallelWorkerFunctionIds.TO_ITERATOR
        ]),
        valuesPerTask: 3
      });

      // slice 2
      expect(threadPoolRunSpy).toHaveBeenCalledWith({
        main: {
          ______serializedFunctionCall: true,
          functionId: ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR, // process
          parameters: [
            {
              environments: [],
              generator: generatorSlice2,
              operations: [
                {
                  iteratee: { ______serializedFunctionCall: true, functionId: functionId("test", 0), parameters: [] }, // powerOf
                  iterator: {
                    ______serializedFunctionCall: true,
                    functionId: ParallelWorkerFunctionIds.MAP,
                    parameters: []
                  } // map
                }
              ],
              taskIndex: 1,
              valuesPerTask: 3
            }
          ]
        },
        taskIndex: 1,
        usedFunctionIds: jasmine.arrayContaining([
          ParallelWorkerFunctionIds.TO_ITERATOR,
          ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR,
          ParallelWorkerFunctionIds.MAP,
          functionId("test", 0)
        ]),
        valuesPerTask: 3
      });
    });
  });

  class SimpleScheduler extends AbstractParallelScheduler {
    public getScheduling(
      totalNumberOfValues: number,
      opts: IDefaultInitializedParallelOptions
    ): IParallelTaskScheduling {
      return undefined as any;
    }
  }
});
