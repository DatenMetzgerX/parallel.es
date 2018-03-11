import { FunctionCall } from "../../function/function-call";
import { IParallelEnvironment, IParallelOperation } from "../";
import { IParallelStream } from "../stream/parallel-stream";

export type IParallelChainEnvironment = FunctionCall | IParallelEnvironment;

/**
 * State of a parallel chain. Dependent of the state of the chain, the chaining of operation, changing of the
 * environment or resolving the chain behaves differently.
 * @param TElement type of the elements
 */
export interface IParallelChainState<TElement> {
  /**
   * Schedules the parallel job onto the thread pool (if not already).
   * @returns the new state that the parallel chain has after scheduling the job
   */
  resolve(): IScheduledParallelChainState<TElement>;

  /**
   * Adds a new operation to the chain
   * @param operation the operation to add to the end of the operation lists
   * @param TElementNew type of the elements after applying the given operation
   * @returns the new state that includes the chained operation
   */
  chainOperation<TElementNew>(operation: IParallelOperation): IParallelChainState<TElementNew>;

  /**
   * Adds the given environment to the current environment
   * @param environment the new environment to use
   * @returns the new state that uses the given environment instead of the existing one
   */
  addEnvironment(environment: IParallelChainEnvironment): IParallelChainState<TElement>;
}

/**
 * State of a parallel state that has been scheduled (or already is resolved).
 */
export interface IScheduledParallelChainState<TElement> extends IParallelChainState<TElement> {
  /**
   * The stream that allows access to the results
   */
  stream: IParallelStream<TElement[], TElement[]>;
}
