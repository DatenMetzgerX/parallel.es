import "babel-polyfill";
import { BrowserWorkerSlave } from "./browser-worker-slave";
import { SlaveFunctionLookupTable } from "../../common/function/slave-function-lookup-table";
import { registerStaticParallelFunctions } from "../../common/parallel/slave/register-parallel-worker-functions";

const slaveFunctionLookupTable = new SlaveFunctionLookupTable();
registerStaticParallelFunctions(slaveFunctionLookupTable);

/** @preserve WORKER_SLAVE_STATIC_FUNCTIONS_PLACEHOLDER */

const slave = new BrowserWorkerSlave(slaveFunctionLookupTable);
onmessage = function(event) {
  slave.onMessage(event.data);
};
