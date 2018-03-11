/**
 * @module parallel
 */
/** needed, typedoc issue */

import { IParallelOperation, IDefaultInitializedParallelOptions } from "./";
import { IParallelGenerator } from "./generator/parallel-generator";
import { ParallelEnvironmentDefinition } from "./parallel-environment-definition";

/**
 * A parallel job that is to be scheduled
 */
export interface IParallelJob {
  /**
   * The generator that creates the initial sequence to process
   */
  generator: IParallelGenerator;

  /**
   * The operations to perform on the sequence elements
   */
  operations: IParallelOperation[];

  /**
   * The environment in which the operations are performed
   */
  environment: ParallelEnvironmentDefinition;

  /**
   * The options defining how the job is to be scheduled.
   */
  options: IDefaultInitializedParallelOptions;
}
