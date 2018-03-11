import { FunctionCallDeserializer } from "../function/function-call-deserializer";
import { ITaskDefinition } from "../task/task-definition";
import { IFunctionDefinition } from "../function/function-defintion";
import {
  functionExecutionError,
  isFunctionResponse,
  isInitializeMessage,
  isScheduleTask,
  requestFunctionMessage,
  workerResultMessage,
  IWorkerMessage
} from "./worker-messages";
import { IWorkerSlave } from "./worker-slave";

/**
 * State of the worker slave.
 */
export abstract class WorkerSlaveState {
  constructor(public name: string, protected slave: IWorkerSlave) {}

  /**
   * Executed when the slave changes its state to this state.
   */
  public enter(): void {
    // intentionally empty
  }

  /**
   * Executed whenever the slave receives a message from the ui-thread while being in this state
   * @param message the received message
   * @returns {boolean} true if the state has handled the message, false otherwise
   */
  public onMessage(message: IWorkerMessage): boolean {
    return false;
  }
}

/**
 * Initial state of a slave. The slave is waiting for the initialization message.
 */
export class DefaultWorkerSlaveState extends WorkerSlaveState {
  constructor(slave: IWorkerSlave) {
    super("Default", slave);
  }

  public onMessage(message: IWorkerMessage): boolean {
    if (isInitializeMessage(message)) {
      this.slave.id = message.workerId;
      this.slave.changeState(new IdleWorkerSlaveState(this.slave));
      return true;
    }
    return false;
  }
}

/**
 * The slave is waiting for work from the ui-thread.
 */
export class IdleWorkerSlaveState extends WorkerSlaveState {
  constructor(slave: IWorkerSlave) {
    super("Idle", slave);
  }

  public onMessage(message: IWorkerMessage): boolean {
    if (!isScheduleTask(message)) {
      return false;
    }

    const task: ITaskDefinition = message.task;
    const missingFunctions = task.usedFunctionIds.filter(id => !this.slave.functionCache.has(id));

    if (missingFunctions.length === 0) {
      this.slave.changeState(new ExecuteFunctionWorkerSlaveState(this.slave, task));
    } else {
      const [head, ...tail] = missingFunctions;
      this.slave.postMessage(requestFunctionMessage(head, ...tail));
      this.slave.changeState(new WaitingForFunctionDefinitionWorkerSlaveState(this.slave, task));
    }

    return true;
  }
}

/**
 * The slave is waiting for the definition of the requested function that is needed to execute the assigned task.
 */
export class WaitingForFunctionDefinitionWorkerSlaveState extends WorkerSlaveState {
  constructor(slave: IWorkerSlave, private task: ITaskDefinition) {
    super("WaitingForFunctionDefinition", slave);
  }

  public onMessage(message: IWorkerMessage): boolean {
    if (isFunctionResponse(message)) {
      if (message.missingFunctions.length > 0) {
        const identifiers = message.missingFunctions.map(functionId => functionId.identifier).join(", ");
        this.slave.postMessage(
          functionExecutionError(
            new Error(`The function ids [${identifiers}] could not be resolved by slave ${this.slave.id}.`)
          )
        );
        this.slave.changeState(new IdleWorkerSlaveState(this.slave));
      } else {
        for (const definition of message.functions as IFunctionDefinition[]) {
          this.slave.functionCache.registerFunction(definition);
        }

        this.slave.changeState(new ExecuteFunctionWorkerSlaveState(this.slave, this.task));
      }
      return true;
    }
    return false;
  }
}

/**
 * The slave is executing the function
 */
export class ExecuteFunctionWorkerSlaveState extends WorkerSlaveState {
  constructor(slave: IWorkerSlave, private task: ITaskDefinition) {
    super("Executing", slave);
  }

  public enter(): void {
    const functionDeserializer = new FunctionCallDeserializer(this.slave.functionCache);

    try {
      const main = functionDeserializer.deserializeFunctionCall(this.task.main);
      const result = main({ functionCallDeserializer: functionDeserializer });
      this.slave.postMessage(workerResultMessage(result));
    } catch (error) {
      this.slave.postMessage(functionExecutionError(error));
    }

    this.slave.changeState(new IdleWorkerSlaveState(this.slave));
  }
}
