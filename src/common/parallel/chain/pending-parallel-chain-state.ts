import { IParallelChainState, IParallelChainEnvironment, IScheduledParallelChainState } from "./parallel-chain-state";
import { ScheduledParallelChainState } from "./scheduled-parallel-chain-state";
import { IParallelGenerator } from "../generator/parallel-generator";
import { IParallelOperation, IDefaultInitializedParallelOptions } from "../";
import { ParallelStream } from "../stream/parallel-stream-impl";
import { concatInPlace } from "../../util/arrays";
import { ParallelEnvironmentDefinition } from "../parallel-environment-definition";

/**
 * Parallel chain has been defined but not yet scheduled.
 *
 * The chain has been created by the user, but non terminating function (reduce, then, catch...) has been called yet.
 * @param TElement type of the elements
 */
export class PendingParallelChainState<TElement> implements IParallelChainState<TElement> {
  public generator: IParallelGenerator;
  public environment: ParallelEnvironmentDefinition;
  public operations: IParallelOperation[];
  public options: IDefaultInitializedParallelOptions;

  /**
   * Creates a new state
   * @param generator the generator to use to generate the input elements and split the job
   * @param options the options
   * @param environment the environment builder that is used to create the environment for the job
   * @param operations the operations to perform on the input elements
   */
  constructor(
    generator: IParallelGenerator,
    options: IDefaultInitializedParallelOptions,
    environment: ParallelEnvironmentDefinition,
    operations: IParallelOperation[]
  ) {
    this.generator = generator;
    this.options = options;
    this.environment = environment;
    this.operations = operations;
  }

  public resolve(): IScheduledParallelChainState<TElement> {
    const tasks = this.options.scheduler.schedule<TElement[]>({
      environment: this.environment,
      generator: this.generator,
      operations: this.operations,
      options: this.options
    });

    return new ScheduledParallelChainState<TElement>(
      ParallelStream.fromTasks(tasks, [], concatInPlace),
      this.options,
      this.environment
    );
  }

  public chainOperation<TElementNew>(operation: IParallelOperation): IParallelChainState<TElementNew> {
    return new PendingParallelChainState(this.generator, this.options, this.environment, [
      ...this.operations,
      operation
    ]);
  }

  public addEnvironment(environment: IParallelChainEnvironment): IParallelChainState<TElement> {
    return new PendingParallelChainState(
      this.generator,
      this.options,
      this.environment.add(environment),
      this.operations
    );
  }
}
