import { DependentParallelChainState } from "../../../../src/common/parallel/chain/dependent-parallel-chain-state";
import { IDefaultInitializedParallelOptions } from "../../../../src/common/parallel";
import { IParallelStream } from "../../../../src/common/parallel/stream/parallel-stream";
import { ScheduledParallelChainState } from "../../../../src/common/parallel/chain/scheduled-parallel-chain-state";
import { IParallelJobScheduler } from "../../../../src/common/parallel/scheduling/parallel-job-scheduler";
import { ParallelCollectionGenerator } from "../../../../src/common/parallel/generator/parallel-collection-generator";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { FunctionCall } from "../../../../src/common/function/function-call";
import { ParallelEnvironmentDefinition } from "../../../../src/common/parallel/parallel-environment-definition";

describe("DependentParallelChainState", function() {
  let previousStream: IParallelStream<string[], string[]>;
  let options: IDefaultInitializedParallelOptions;
  let environment: ParallelEnvironmentDefinition;
  let scheduler: IParallelJobScheduler;
  let scheduleSpy: jasmine.Spy;
  let previousStreamThenSpy: jasmine.Spy;

  beforeEach(function() {
    scheduler = jasmine.createSpyObj<IParallelJobScheduler>("scheduler", ["schedule"]);
    scheduleSpy = scheduler.schedule as jasmine.Spy;
    options = {
      functionCallSerializer: undefined as any,
      scheduler,
      threadPool: undefined as any
    };

    environment = ParallelEnvironmentDefinition.of();
    previousStream = jasmine.createSpyObj<IParallelStream<string[], string[]>>("previousStream", ["then"]);
    previousStreamThenSpy = previousStream.then as jasmine.Spy;
  });

  describe("resolve", function() {
    it("returns a new scheduled parallel chain state", function() {
      // arrange
      const state = new DependentParallelChainState(previousStream, options, environment);

      // act
      const newState = state.resolve();

      // assert
      expect(newState).toEqual(jasmine.any(ScheduledParallelChainState));
    });

    it("schedules the tasks as soon as the previous stream has completed", function() {
      // arrange
      const state = new DependentParallelChainState(previousStream, options, environment);
      scheduleSpy.and.returnValue([]);
      state.resolve();

      // act
      previousStreamThenSpy.calls.argsFor(0)[0].apply(undefined, [["a", "b", "c"]]); // previous stream completed

      // assert
      expect(scheduler.schedule).toHaveBeenCalledWith({
        environment,
        generator: new ParallelCollectionGenerator(["a", "b", "c"]),
        operations: [],
        options
      });
    });
  });

  describe("chainOperation", function() {
    it("returns a new state", function() {
      const state = new DependentParallelChainState(previousStream, options, environment);
      const operation = {
        iteratee: FunctionCall.create(() => undefined),
        iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
      };

      // act
      const chained = state.chainOperation(operation);

      // assert
      expect(chained).not.toBe(state);
    });

    it("returns a that also contains the given operation", function() {
      // arrange
      const state = new DependentParallelChainState(previousStream, options, environment);
      const operation = {
        iteratee: FunctionCall.create(() => undefined),
        iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
      };

      // act
      const chained = state.chainOperation(operation);

      // assert
      expect(chained).toEqual(new DependentParallelChainState(previousStream, options, environment, [operation]));
    });
  });

  describe("addEnvironment", function() {
    it("returns a new state", function() {
      const state = new DependentParallelChainState(previousStream, options, environment);

      // act
      const chained = state.addEnvironment({ test: 15 });

      // assert
      expect(chained).not.toBe(state);
    });

    it("changes the environment", function() {
      const state = new DependentParallelChainState(previousStream, options, environment);
      const newEnvironment = ParallelEnvironmentDefinition.of({ test: 15 });

      // act
      const chained = state.addEnvironment({ test: 15 });

      // assert
      expect(chained).toEqual(new DependentParallelChainState(previousStream, options, newEnvironment));
    });
  });
});
