import { IDefaultInitializedParallelOptions } from "../../../../src/common/parallel";
import { IParallelJobScheduler } from "../../../../src/common/parallel/scheduling/parallel-job-scheduler";
import { PendingParallelChainState } from "../../../../src/common/parallel/chain/pending-parallel-chain-state";
import { IParallelGenerator } from "../../../../src/common/parallel/generator/parallel-generator";
import { ParallelCollectionGenerator } from "../../../../src/common/parallel/generator/parallel-collection-generator";
import { ScheduledParallelChainState } from "../../../../src/common/parallel/chain/scheduled-parallel-chain-state";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { FunctionCall } from "../../../../src/common/function/function-call";
import { ParallelEnvironmentDefinition } from "../../../../src/common/parallel/parallel-environment-definition";

describe("PendingParallelChainState", function() {
  let options: IDefaultInitializedParallelOptions;
  let environment: ParallelEnvironmentDefinition;
  let scheduler: IParallelJobScheduler;
  let generator: IParallelGenerator;
  let scheduleSpy: jasmine.Spy;
  let state: PendingParallelChainState<number>;

  beforeEach(function() {
    scheduler = jasmine.createSpyObj<IParallelJobScheduler>("scheduler", ["schedule"]);
    scheduleSpy = scheduler.schedule as jasmine.Spy;
    options = {
      functionCallSerializer: undefined as any,
      scheduler,
      threadPool: undefined as any
    };

    environment = ParallelEnvironmentDefinition.of({ test: 10 });
    generator = new ParallelCollectionGenerator([1, 2, 3, 4]);
    state = new PendingParallelChainState(generator, options, environment, []);
  });

  describe("resolve", function() {
    it("schedules the tasks", function() {
      // arrange
      scheduleSpy.and.returnValue([]);

      // act
      state.resolve();

      // assert
      expect(scheduleSpy).toHaveBeenCalledWith({
        environment,
        generator,
        operations: [],
        options
      });
    });

    it("returns a scheduled parallel chain state", function() {
      // arrange
      scheduleSpy.and.returnValue([]);

      // act
      const scheduledState = state.resolve();

      // assert
      expect(scheduledState).toEqual(new ScheduledParallelChainState(jasmine.anything() as any, options, environment));
    });
  });

  describe("chainOperation", function() {
    it("returns a new state", function() {
      // arrange
      const operation = {
        iteratee: FunctionCall.create(() => undefined),
        iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
      };

      // act
      expect(state.chainOperation(operation)).not.toBe(state);
    });

    it("returns a state containing the chained operation", function() {
      // arrange
      const operation = {
        iteratee: FunctionCall.create(() => undefined),
        iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
      };

      // act
      expect(state.chainOperation(operation)).toEqual(
        new PendingParallelChainState(generator, options, environment, [operation])
      );
    });
  });

  describe("addEnvironment", function() {
    it("returns a new state", function() {
      expect(state.addEnvironment({ test: 25 })).not.toBe(state);
    });

    it("returns a state containing the new environment", function() {
      expect(state.addEnvironment({ test: 25 })).toEqual(
        new PendingParallelChainState(generator, options, ParallelEnvironmentDefinition.of({ test: 25 }), [])
      );
    });
  });
});
