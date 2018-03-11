import "babel-polyfill";
import { SlaveFunctionLookupTable } from "../../common/function/slave-function-lookup-table";
import { registerStaticParallelFunctions } from "../../common/parallel/slave/register-parallel-worker-functions";
import { NodeWorkerSlave } from "./node-worker-slave";
import * as process from "process";

const slaveFunctionLookupTable = new SlaveFunctionLookupTable();
registerStaticParallelFunctions(slaveFunctionLookupTable);

/** @preserve WORKER_SLAVE_STATIC_FUNCTIONS_PLACEHOLDER */

const slave = new NodeWorkerSlave(slaveFunctionLookupTable);
process.on("message", slave.onMessage.bind(slave));
