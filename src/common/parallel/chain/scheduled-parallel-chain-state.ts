import { IParallelChainState, IParallelChainEnvironment, IScheduledParallelChainState } from "./parallel-chain-state";
import { IParallelOperation, IDefaultInitializedParallelOptions } from "../";
import { IParallelStream } from "../stream/parallel-stream";
import { DependentParallelChainState } from "./dependent-parallel-chain-state";
import { ParallelEnvironmentDefinition } from "../parallel-environment-definition";

/**
 * State of a parallel chain whose job has been scheduled on the thread pool (or even where the computation already has completed).
 * @param TElement type of the elements produced by the stream
 */
export class ScheduledParallelChainState<TElement> implements IScheduledParallelChainState<TElement> {
  public stream: IParallelStream<TElement[], TElement[]>;

  /**
   * Creates a new state that is based on the given stream
   * @param stream the stream for the scheduled tasks
   * @param options the options used for the scheduled job
   * @param environment the environment used for the scheduled job
   */
  constructor(
    stream: IParallelStream<TElement[], TElement[]>,
    private options: IDefaultInitializedParallelOptions,
    private environment: ParallelEnvironmentDefinition
  ) {
    this.stream = stream;
  }

  public resolve(): IScheduledParallelChainState<TElement> {
    return this;
  }

  public chainOperation<TElementNew>(operation: IParallelOperation): IParallelChainState<TElementNew> {
    return new DependentParallelChainState(this.stream, this.options, this.environment, [operation]);
  }

  public addEnvironment(environment: IParallelChainEnvironment): IParallelChainState<TElement> {
    return new DependentParallelChainState(this.stream, this.options, this.environment.add(environment));
  }
}
