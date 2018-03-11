import { IFunctionLookupTable } from "../../function/function-lookup-table";
import { ParallelWorkerFunctionIds } from "./parallel-worker-functions";
import { identity } from "../../util/identity";
import { filterIterator } from "./filter-iterator";
import { mapIterator } from "./map-iterator";
import { parallelJobExecutor } from "./parallel-job-executor";
import { rangeIterator } from "./range-iterator";
import { reduceIterator } from "./reduce-iterator";
import { toIterator } from "../../util/arrays";

/**
 * Registers the static parallel functions
 * @param lookupTable the table into which the function should be registered
 */
export function registerStaticParallelFunctions(lookupTable: IFunctionLookupTable) {
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.IDENTITY, identity);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.FILTER, filterIterator);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.MAP, mapIterator);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.PARALLEL_JOB_EXECUTOR, parallelJobExecutor);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.RANGE, rangeIterator);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.REDUCE, reduceIterator);
  lookupTable.registerStaticFunction(ParallelWorkerFunctionIds.TO_ITERATOR, toIterator);
}
