import {ScheduledParallelChainState} from "../../../../src/common/parallel/chain/scheduled-parallel-chain-state";
import {IEmptyParallelEnvironment, IDefaultInitializedParallelOptions} from "../../../../src/common/parallel";
import {IParallelStream} from "../../../../src/common/parallel/stream/parallel-stream";
import {DependentParallelChainState} from "../../../../src/common/parallel/chain/dependent-parallel-chain-state";
import {ParallelWorkerFunctionIds} from "../../../../src/common/parallel/slave/parallel-worker-functions";
import {FunctionCall} from "../../../../src/common/function/function-call";

describe("ScheduledParallelChainState", function () {
    let options: IDefaultInitializedParallelOptions;
    let environment: IEmptyParallelEnvironment;
    let stream: IParallelStream<string[], string[]>;
    let state: ScheduledParallelChainState<string>;

    beforeEach(function () {
        options = {
            maxConcurrencyLevel: 2,
            scheduler: undefined as any,
            threadPool: undefined as any
        };

        environment = { test: 10 };
        stream = jasmine.createSpyObj("stream", ["then"]);

        state = new ScheduledParallelChainState(stream, options, environment);
    });

    describe("resolve", function () {
        it("returns the same instance", function () {
            expect(state.resolve()).toBe(state);
        });
    });

    describe("chainOperation", function () {
        it("returns a dependent parallel chain for the current stream and the new operation", function () {
            // arrange
            const operation = {
                iteratee: FunctionCall.create(() => undefined),
                iterator: FunctionCall.create(ParallelWorkerFunctionIds.MAP)
            };

            expect(state.chainOperation(operation)).toEqual(new DependentParallelChainState(stream, options, environment, [operation]));
        });
    });

    describe("changeEnvironment", function () {
        it("returns a dependent parallel chain for the current stream and the new environment", function () {
            expect(state.changeEnvironment({ test: 25 })).toEqual(new DependentParallelChainState(stream, options, { test: 25 }, []));
        });
    });
});