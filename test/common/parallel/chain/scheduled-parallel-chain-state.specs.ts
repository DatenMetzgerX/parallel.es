import { ScheduledParallelChainState } from "../../../../src/common/parallel/chain/scheduled-parallel-chain-state";
import { IDefaultInitializedParallelOptions } from "../../../../src/common/parallel";
import { IParallelStream } from "../../../../src/common/parallel/stream/parallel-stream";
import { DependentParallelChainState } from "../../../../src/common/parallel/chain/dependent-parallel-chain-state";
import { ParallelWorkerFunctionIds } from "../../../../src/common/parallel/slave/parallel-worker-functions";
import { FunctionCall } from "../../../../src/common/function/function-call";
import { ParallelEnvironmentDefinition } from "../../../../src/common/parallel/parallel-environment-definition";

describe("ScheduledParallelChainState", function() {
  let options: IDefaultInitializedParallelOptions;
  let environment: ParallelEnvironmentDefinition;
  let stream: IParallelStream<string[], string[]>;
  let state: ScheduledParallelChainState<string>;

  beforeEach(function() {
    options = {
      functionCallSerializer: undefined as any,
      scheduler: undefined as any,
      threadPool: undefined as any
    };

    environment = ParallelEnvironmentDefinition.of({ test: 10 });
    stream = jasmine.createSpyObj("stream", ["then"]);

    state = new ScheduledParallelChainState(stream, options, environment);
  });

  describe("resolve", function() {
    it("returns the same instance", function() {
      expect(state.resolve()).toBe(state);
    });
  });

  describe("chainOperation", function() {
    it("returns a dependent parallel chain for the current stream and the new operation", function() {
      // arrange
      const operation = {
        iteratee: FunctionCall.create(() => undefined),
        iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
      };

      expect(state.chainOperation(operation)).toEqual(
        new DependentParallelChainState(stream, options, environment, [operation])
      );
    });
  });

  describe("addEnvironment", function() {
    it("returns a dependent parallel chain for the current stream and the new environment", function() {
      expect(state.addEnvironment({ test: 25 })).toEqual(
        new DependentParallelChainState(stream, options, ParallelEnvironmentDefinition.of({ test: 25 }), [])
      );
    });
  });
});
