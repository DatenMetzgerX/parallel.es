import { IParallelChain } from "./parallel-chain";
import { IParallelStream } from "../stream/parallel-stream";
import { ParallelWorkerFunctionIds } from "../slave/parallel-worker-functions";
import { IParallelEnvironment, IParallelTaskEnvironment } from "../parallel-environment";
import { FunctionCall } from "../../function/function-call";
import { IParallelChainState, IParallelChainEnvironment } from "./parallel-chain-state";
import { ParallelStream } from "../stream/parallel-stream-impl";
import { IFunctionId, isFunctionId } from "../../function/function-id";
import { isSerializedFunctionCall } from "../../function/serialized-function-call";

/**
 * Implementation of a {@link IParallelChain}
 *
 * The implementation uses an internal state ({@link IParallelChainState}) to distinguishes between a not yet scheduled job ({@link PendingParallelChainState}),
 * a job that has been scheduled but potentially not yet completed ({@link ScheduledParallelChainState}) and a job that
 * is waiting for another one to complete, but has not yet been scheduled ({@link DependentParallelChainState}).
 *
 * @param TIn type of the elements created by the generator
 * @param TEnv type of the job environment
 * @param TOut type of the elements in the resulting array
 */
export class ParallelChainImpl<TIn, TEnv extends IParallelEnvironment, TOut>
  implements IParallelChain<TIn, TEnv, TOut> {
  public state: IParallelChainState<TOut>;

  /**
   * Creates a new parallel chain with the given state
   * @param state the state of the chain
   */
  constructor(state: IParallelChainState<TOut>) {
    this.state = state;
  }

  // region Chaining
  public inEnvironment<TEnvNew extends IParallelEnvironment>(
    newEnv: Function | IParallelEnvironment | IFunctionId,
    ...params: any[]
  ): IParallelChain<TIn, TEnv & TEnvNew, TOut> {
    let env: IParallelChainEnvironment | undefined;
    if (typeof newEnv === "function" || isFunctionId(newEnv)) {
      env = FunctionCall.createUnchecked(newEnv, ...params);
    } else if (isSerializedFunctionCall(newEnv)) {
      env = FunctionCall.fromSerialized(newEnv);
    } else {
      env = newEnv;
    }

    return new ParallelChainImpl<TIn, TEnv & TEnvNew, TOut>(this.state.addEnvironment(env));
  }

  public map<TResult>(
    mapper: ((this: void, element: TOut, env: TEnv & IParallelTaskEnvironment) => TResult) | IFunctionId
  ): IParallelChain<TIn, TEnv, TResult> {
    return this._chain<TResult>(
      FunctionCall.createUnchecked(ParallelWorkerFunctionIds.MAP),
      FunctionCall.createUnchecked(mapper)
    );
  }

  public reduce<TResult>(
    defaultValue: TResult,
    accumulator:
      | ((this: void, memo: TResult, value: TOut, env: TEnv & IParallelTaskEnvironment) => TResult)
      | IFunctionId,
    combiner?: (this: void, sub1: TResult, sub2: TResult) => TResult
  ): IParallelStream<TResult[], TResult> {
    const combineOperation: (accumulatedValue: TResult, value: TResult) => TResult = combiner || (accumulator as any);
    const reduced = this._chain<TResult>(
      FunctionCall.createUnchecked(ParallelWorkerFunctionIds.REDUCE, defaultValue),
      FunctionCall.createUnchecked(accumulator)
    ).resolveChain();
    return ParallelStream.transform(reduced, (subResults: TResult[]) => {
      if (subResults.length === 0) {
        return defaultValue;
      }

      const [head, ...tail] = subResults;
      let sum = head;

      for (const temp of tail) {
        sum = combineOperation(sum, temp);
      }

      return sum;
    });
  }

  public filter(
    predicate: ((this: void, value: TOut, env: TEnv & IParallelTaskEnvironment) => boolean) | IFunctionId
  ): IParallelChain<TIn, TEnv, TOut> {
    return this._chain<TOut>(
      FunctionCall.createUnchecked(ParallelWorkerFunctionIds.FILTER),
      FunctionCall.createUnchecked(predicate)
    );
  }

  // endregion

  // region Resolving
  public subscribe(
    onNext: (subResult: TOut[], taskIndex: number, valuesPerWorker: number) => void,
    onError?: (reason: any) => void,
    onComplete?: (result: TOut[]) => void
  ): IParallelStream<TOut[], TOut[]> {
    return this.resolveChain().subscribe(onNext, onError, onComplete);
  }

  public then<TResult1, TResult2>(
    onfulfilled: (value: TOut[]) => PromiseLike<TResult1> | TResult1,
    onrejected: (reason: any) => PromiseLike<TResult2> | TResult2
  ): Promise<TResult2 | TResult1>;
  public then<TResult>(
    onfulfilled: (value: TOut[]) => PromiseLike<TResult> | TResult,
    onrejected: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(onfulfilled: (value: TOut[]) => PromiseLike<TResult> | TResult): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TOut[]) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TOut[]) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => void
  ): Promise<TResult>;
  public then(onfulfilled?: any, onrejected?: any): any {
    return this.resolveChain().then(onfulfilled, onrejected);
  }

  public catch<TResult>(onrejected: (reason: any) => PromiseLike<TResult> | TResult): Promise<TResult | TOut[]>;
  public catch(onrejected: (reason: any) => PromiseLike<TOut[]> | TOut[]): Promise<TOut[]>;
  public catch(onrejected: any): any {
    return this.resolveChain().catch(onrejected);
  }

  private resolveChain(): IParallelStream<TOut[], TOut[]> {
    const resolvedState = (this.state = this.state.resolve());
    return resolvedState.stream;
  }
  // endregion

  private _chain<TResult>(iterator: FunctionCall, iteratee: FunctionCall): ParallelChainImpl<TIn, TEnv, TResult> {
    const operation = { iterator, iteratee };
    return new ParallelChainImpl(this.state.chainOperation(operation));
  }
}
