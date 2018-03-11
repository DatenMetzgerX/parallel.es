import { ISerializedFunctionCall } from "../../function/serialized-function-call";
import { FunctionCallSerializer } from "../../function/function-call-serializer";
import { IParallelGenerator } from "./parallel-generator";
import { ParallelWorkerFunctionIds } from "../slave/parallel-worker-functions";
import { FunctionCall } from "../../function/function-call";
/**
 * Generator for creating values inside of a range
 */
export class ParallelRangeGenerator implements IParallelGenerator {
  /**
   * Creates a new parallel generator
   * @param start depends on the number of arguments. If called with one argument, then it is the end of the range and start is initialized with 0.
   * If called with two or more, then it defines the start of the range.
   * @param end defines the end of the range
   * @param step defines the step size. By default 1 if start < end and -1 if start > end.
   * @throws If step is equal to 0
   */
  public static create(start: number, end?: number, step?: number) {
    if (typeof end === "undefined") {
      end = start;
      start = 0;
    }

    if (typeof step === "undefined") {
      step = end < start ? -1 : 1;
    }

    if (step === 0) {
      throw new Error("Step size of zero is not allowed");
    }

    return new ParallelRangeGenerator(start, end, step);
  }

  public readonly start: number;
  public readonly end: number;
  public readonly step: number;

  private constructor(start: number, end: number, step: number) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  get length(): number {
    return Math.ceil((this.end - this.start) / this.step);
  }

  public serializeSlice(
    index: number,
    numberOfItems: number,
    functionCallSerializer: FunctionCallSerializer
  ): ISerializedFunctionCall {
    const sliceSize = numberOfItems * this.step;
    const sliceStart = this.start + index * sliceSize;
    const sliceEnd = Math.min(sliceStart + sliceSize, this.end);

    return functionCallSerializer.serializeFunctionCall(
      FunctionCall.createUnchecked(ParallelWorkerFunctionIds.RANGE, sliceStart, sliceEnd, this.step)
    );
  }
}
