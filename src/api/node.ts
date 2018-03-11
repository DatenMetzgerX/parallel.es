import "babel-polyfill";
import * as os from "os";
import { DynamicFunctionRegistry } from "../common/function/dynamic-function-registry";
import { FunctionCallSerializer } from "../common/function/function-call-serializer";
import { NodeWorkerThreadFactory } from "../node/worker/node-worker-thread-factory";
import { DefaultThreadPool } from "../common/thread-pool/default-thread-pool";
import { IParallel } from "../common/parallel";
import { parallelFactory } from "../common/parallel/parallel-impl";
import { DefaultParallelScheduler } from "../common/parallel/scheduling/default-parallel-scheduler";
export * from "./shared";

const functionLookupTable = new DynamicFunctionRegistry();
const maxConcurrencyLevel = os.cpus().length;

const functionCallSerializer = new FunctionCallSerializer(functionLookupTable);
const threadPool = new DefaultThreadPool(new NodeWorkerThreadFactory(functionLookupTable), { maxConcurrencyLevel });

/**
 * The global parallel instance.
 */
const parallel: IParallel = parallelFactory({
  functionCallSerializer,
  scheduler: new DefaultParallelScheduler(),
  threadPool
});

export default parallel;
