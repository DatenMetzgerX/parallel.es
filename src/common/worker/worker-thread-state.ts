import {
  isFunctionRequest,
  IFunctionRequest,
  functionResponseMessage,
  isWorkerResult,
  isFunctionExecutionError,
  IWorkerMessage
} from "./worker-messages";
import { DynamicFunctionRegistry } from "../function/dynamic-function-registry";
import { IFunctionId } from "../function/function-id";
import { IFunctionDefinition } from "../function/function-defintion";
import { IWorkerThreadSlaveCommunicationChannel } from "./worker-thread-slave-communication-channel";

/**
 * State of the worker thread
 */
export class WorkerThreadState {
  constructor(public name: string) {}

  /**
   * Called if the worker thread has received a message from a slave
   * @param event the received message
   */
  public onMessage(message: IWorkerMessage): void {
    throw new Error(`Worker thread in state '${this.name}' cannot handle the received message (${message.type}).`);
  }

  /**
   * Called if a fatal error on the Slave. Errors occurring during task execution are specially handled
   * and passed to {@link WorkerThreadState.onMessage}
   * @param error
   */
  public onError(error: any) {
    // tslint:disable-next-line:no-console
    console.error("Processing error on worker slave", error);
  }
}

/**
 * Worker thread is executing a function on the {@link IWorkerSlave}
 */
export class WorkerThreadExecutingState extends WorkerThreadState {
  constructor(
    private callback: (error: any, result: any) => void,
    private functionRegistry: DynamicFunctionRegistry,
    private communicationChannel: IWorkerThreadSlaveCommunicationChannel
  ) {
    super("executing");
  }

  public onMessage(message: IWorkerMessage) {
    if (isFunctionRequest(message)) {
      this.handleFunctionRequest(message);
    } else if (isWorkerResult(message)) {
      this.callback(undefined, message.result);
    } else if (isFunctionExecutionError(message)) {
      this.callback(message.error, undefined);
    } else {
      super.onMessage(message);
    }
  }

  public onError(error: any) {
    this.callback(error, undefined);
  }

  private handleFunctionRequest(message: IFunctionRequest) {
    const missingIds: IFunctionId[] = [];
    const definitions: IFunctionDefinition[] = [];

    for (const functionId of message.functionIds) {
      const definition = this.functionRegistry.getDefinition(functionId);
      if (definition) {
        definitions.push(definition);
      } else {
        missingIds.push(functionId);
      }
    }

    this.communicationChannel.sendMessage(functionResponseMessage(definitions, ...missingIds));
  }
}
