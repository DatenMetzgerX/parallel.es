/**
 * Main Facade for the parallel module. The default export is the global {@link IParallel} instance.
 * @module parallel
 * @preferred
 */ /** */

import {parallelFactory} from "../common/parallel/parallel-impl";
import {DefaultThreadPool} from "../common/thread-pool/default-thread-pool";
import {BrowserWorkerThreadFactory} from "./worker/browser-worker-thread-factory";
import {DefaultParallelScheduler} from "../common/parallel/scheduling/default-parallel-scheduler";
import {IParallel} from "../common/parallel";
import {DynamicFunctionRegistry} from "../common/function/dynamic-function-registry";
import {FunctionCallSerializer} from "../common/function/function-call-serializer";

export {ITaskDefinition} from "../common/task/task-definition";
export {ITask} from "../common/task/task";
export {IFunctionDefinition} from "../common/function/function-defintion";
export {IFunctionId} from "../common/function/function-id";
export {FunctionCall} from "../common/function/function-call";
export {ISerializedFunctionCall, isSerializedFunctionCall} from "../common/function/serialized-function-call";
export {FunctionCallSerializer} from "../common/function/function-call-serializer";
export {IThreadPool} from "../common/thread-pool/thread-pool";
export * from "../common/parallel/index";

const functionLookupTable = new DynamicFunctionRegistry();
const maxConcurrencyLevel = (window.navigator as any)["hardwareConcurrency"] || 4;
const functionCallSerializer = new FunctionCallSerializer(functionLookupTable);
const threadPool = new DefaultThreadPool(new BrowserWorkerThreadFactory(functionLookupTable), functionCallSerializer, {maxConcurrencyLevel});

/**
 * The global parallel instance.
 */
const parallel: IParallel = parallelFactory({ maxConcurrencyLevel, scheduler: new DefaultParallelScheduler(), threadPool });
export default parallel;
