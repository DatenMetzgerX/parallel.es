import { functionId, IFunctionId } from "../../function/function-id";

export const ParallelWorkerFunctionIds = {
  FILTER: functionId("parallel", 0) as IFunctionId,
  IDENTITY: functionId("parallel", 1),
  MAP: functionId("parallel", 2),
  PARALLEL_JOB_EXECUTOR: functionId("parallel", 3),
  RANGE: functionId("parallel", 4),
  REDUCE: functionId("parallel", 5),
  TIMES: functionId("parallel", 6),
  TO_ITERATOR: functionId("parallel", 7)
};
