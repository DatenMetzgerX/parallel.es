import { ITaskDefinition } from "../task/task-definition";

/**
 * Definition of a parallel task to execute.
 */
export interface IParallelTaskDefinition extends ITaskDefinition {
  /**
   * Number of values that are assigned to each task at most
   */
  valuesPerTask: number;

  /**
   * The index of this task (relative to the other tasks spawned to perform this parallel operation)
   */
  taskIndex: number;
}
