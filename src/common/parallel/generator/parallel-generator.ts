import { ISerializedFunctionCall } from "../../function/serialized-function-call";
import { FunctionCallSerializer } from "../../function/function-call-serializer";

/**
 * Generator that creates a sequence of values and is capable
 * to distribute the value generations onto various tasks
 */
export interface IParallelGenerator {
  /**
   * Total number of elements that this generator return
   */
  length: number;

  /**
   * Serializes the generation of a single slice that can be executed as separate task
   * @param index the slice/task index (start 0)
   * @param numberOfItems the number of items to include in this slice
   * @param functionCallSerializer the serialized function call
   */
  serializeSlice(
    index: number,
    numberOfItems: number,
    functionCallSerializer: FunctionCallSerializer
  ): ISerializedFunctionCall;
}
