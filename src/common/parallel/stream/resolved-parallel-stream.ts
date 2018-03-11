import { IParallelStream } from "./parallel-stream";

/**
 * Parallel stream for a static, already resolved result.
 *
 * This stream has no sub results as the end result is already known. It can also never fail.
 */
export class ResolvedParallelStream<TSub, TOut> implements IParallelStream<TSub, TOut> {
  private promise: Promise<TOut>;

  /**
   * Creates a new stream that returns the given end result.
   * @param result the end result to return
   */
  constructor(result: TOut) {
    this.promise = Promise.resolve(result);
  }

  public subscribe(
    onNext: (subResult: TSub, taskIndex: number, valuesPerWorker: number) => void,
    onError?: (reason: any) => void,
    onComplete?: (result: TOut) => void
  ): IParallelStream<TSub, TOut> {
    if (onComplete || onError) {
      this.promise.then(onComplete!, onError!);
    }

    return this;
  }

  public then<TResult1, TResult2>(
    onfulfilled: (value: TOut) => PromiseLike<TResult1> | TResult1,
    onrejected: (reason: any) => PromiseLike<TResult2> | TResult2
  ): Promise<TResult2 | TResult1>;
  public then<TResult>(
    onfulfilled: (value: TOut) => PromiseLike<TResult> | TResult,
    onrejected: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(onfulfilled: (value: TOut) => PromiseLike<TResult> | TResult): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TOut) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => PromiseLike<TResult> | TResult
  ): Promise<TResult>;
  public then<TResult>(
    onfulfilled?: (value: TOut) => PromiseLike<TResult> | TResult,
    onrejected?: (reason: any) => void
  ): Promise<TResult>;
  public then(onfulfilled?: any, onrejected?: any): any {
    return this.promise.then(onfulfilled, onrejected);
  }

  public catch<TResult>(onrejected: (reason: any) => PromiseLike<TResult> | TResult): Promise<TResult | TOut>;
  public catch(onrejected: (reason: any) => PromiseLike<TOut> | TOut): Promise<TOut>;
  public catch(onrejected: any): any {
    return this.promise.catch(onrejected);
  }
}
