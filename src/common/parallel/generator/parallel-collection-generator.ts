import { IParallelGenerator } from "./parallel-generator";
import { FunctionCallSerializer } from "../../function/function-call-serializer";
import { ISerializedFunctionCall } from "../../function/serialized-function-call";
import { ParallelWorkerFunctionIds } from "../slave/parallel-worker-functions";
import { FunctionCall } from "../../function/function-call";
/**
 * Generator for arrays.
 * Splits the array elements onto separate tasks.
 * @param T type of the array elements
 */
export class ParallelCollectionGenerator<T> implements IParallelGenerator {
  /**
   * Creates a new instance over the given collection
   * @param collection
   */
  constructor(public collection: T[]) {}

  get length(): number {
    return this.collection.length;
  }

  public serializeSlice(
    index: number,
    numberOfItems: number,
    functionCallSerializer: FunctionCallSerializer
  ): ISerializedFunctionCall {
    const start = numberOfItems * index;
    const end = start + numberOfItems;

    return functionCallSerializer.serializeFunctionCall(
      FunctionCall.createUnchecked(ParallelWorkerFunctionIds.TO_ITERATOR, this.collection.slice(start, end))
    );
  }
}
