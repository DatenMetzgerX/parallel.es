import { IParallelChainState, IScheduledParallelChainState, IParallelChainEnvironment } from "./parallel-chain-state";
import { IParallelOperation, IDefaultInitializedParallelOptions } from "../";
import { IParallelStream } from "../stream/parallel-stream";
import { ScheduledParallelChainState } from "./scheduled-parallel-chain-state";
import { ParallelCollectionGenerator } from "../generator/parallel-collection-generator";
import { concatInPlace } from "../../util/arrays";
import { ParallelStream } from "../stream/parallel-stream-impl";
import { ParallelEnvironmentDefinition } from "../parallel-environment-definition";

/**
 * The state of a parallel chain if additional operations should be performed on an already scheduled parallel chain.
 *
 * The state needs to wait for the previous parallel job to complete and then take that result to continue the additional
 * computations.
 *
 * @param TPrevious Type of the array elements of the dependent stream
 * @param TElement Type of the array elements of the resulting array
 */
export class DependentParallelChainState<TPrevious, TElement> implements IParallelChainState<TElement> {
  /**
   * Creates a new dependent stream
   * @param previousStream the stream upon which the new stream depends on
   * @param options the options used by this parallel job
   * @param environment the environment used by the job
   * @param operations the operations to performed when the previous stream has completed
   */
  constructor(
    private previousStream: IParallelStream<TPrevious[], TPrevious[]>,
    private options: IDefaultInitializedParallelOptions,
    private environment: ParallelEnvironmentDefinition,
    private operations: IParallelOperation[] = []
  ) {}

  public resolve(): IScheduledParallelChainState<TElement> {
    let next: ((subResult: TElement[], taskIndex: number, valuesPerTask: number) => void) | undefined;
    let resolve: ((result: TElement[]) => void) | undefined;
    let reject: ((reason: any) => void) | undefined;

    const stream = new ParallelStream<TElement[], TElement[]>((nxt, rsolve, rject) => {
      next = nxt;
      resolve = rsolve;
      reject = rject;
    });

    this.previousStream.then(result => {
      const tasks = this.options.scheduler.schedule<TElement[]>({
        environment: this.environment,
        generator: new ParallelCollectionGenerator(result),
        operations: this.operations,
        options: this.options
      });

      const wrappedStream = ParallelStream.fromTasks(tasks, [], concatInPlace);
      wrappedStream.subscribe(next!, reject!, resolve!);
    }, reject!);

    return new ScheduledParallelChainState(stream, this.options, this.environment);
  }

  public chainOperation<TElementNew>(operation: IParallelOperation): IParallelChainState<TElementNew> {
    return new DependentParallelChainState<TPrevious, TElementNew>(
      this.previousStream,
      this.options,
      this.environment,
      [...this.operations, operation]
    );
  }

  public addEnvironment(environment: IParallelChainEnvironment): IParallelChainState<TElement> {
    return new DependentParallelChainState(
      this.previousStream,
      this.options,
      this.environment.add(environment),
      this.operations
    );
  }
}
