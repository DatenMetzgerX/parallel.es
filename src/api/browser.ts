/**
 * Main Facade for the parallel module. The default export is the global {@link IParallel} instance.
 * @module parallel
 * @preferred
 */ /** */
import "babel-polyfill";
import { parallelFactory } from "../common/parallel/parallel-impl";
import { DefaultThreadPool } from "../common/thread-pool/default-thread-pool";
import { DefaultParallelScheduler } from "../common/parallel/scheduling/default-parallel-scheduler";
import { DynamicFunctionRegistry } from "../common/function/dynamic-function-registry";
import { FunctionCallSerializer } from "../common/function/function-call-serializer";
import { BrowserWorkerThreadFactory } from "../browser/worker/browser-worker-thread-factory";
import { IParallel } from "../common/parallel";

export * from "./shared";

const functionLookupTable = new DynamicFunctionRegistry();
const maxConcurrencyLevel = (window.navigator as any)["hardwareConcurrency"] || 4;
const functionCallSerializer = new FunctionCallSerializer(functionLookupTable);
const threadPool = new DefaultThreadPool(new BrowserWorkerThreadFactory(functionLookupTable), { maxConcurrencyLevel });

/**
 * The global parallel instance.
 */
const parallel: IParallel = parallelFactory({
  functionCallSerializer,
  scheduler: new DefaultParallelScheduler(),
  threadPool
});
export default parallel;
