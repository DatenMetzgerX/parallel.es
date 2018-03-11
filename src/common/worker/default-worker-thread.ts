import { ITaskDefinition } from "../task/task-definition";
import { initializeWorkerMessage, stopMessage, scheduleTaskMessage, IWorkerMessage } from "./worker-messages";
import { IWorkerThread } from "./worker-thread";
import { DynamicFunctionRegistry } from "../function/dynamic-function-registry";
import { WorkerThreadState, WorkerThreadExecutingState } from "./worker-thread-state";
import { IWorkerThreadSlaveCommunicationChannel } from "./worker-thread-slave-communication-channel";

let workerThreadId = 0;

/**
 * Worker Thread Endpoint in the UI-Thread.
 * Implements the communication with the {@link IWorkerSlave} in the worker thread.
 */
export class DefaultWorkerThread implements IWorkerThread {
  /**
   * Unique id of this worker thread
   */
  public id = ++workerThreadId;

  /**
   * The current state of the worker thread
   */
  public state: WorkerThreadState = new WorkerThreadState("default");

  private stopped: boolean = false;

  /**
   * Creates a new instance that communicates with the given worker
   * @param communicationChannel the {@link IWorkerThreadSlaveCommunicationChannel} to the slave
   * @param functionLookupTable
   */
  constructor(
    private functionLookupTable: DynamicFunctionRegistry,
    private communicationChannel: IWorkerThreadSlaveCommunicationChannel
  ) {
    const that = this;
    this.communicationChannel.addEventListener("message", function() {
      that.onWorkerMessage.apply(that, arguments);
    });
    this.communicationChannel.addEventListener("error", function() {
      that.onError.apply(that, arguments);
    });
  }

  /**
   * Assigns a unique id to the worker
   * Can only be invoked once. Must be invoked before any task is scheduled.
   */
  public initialize() {
    if (this.state.name !== "default") {
      throw new Error(
        `The worker thread can only be initialized if in state default but actual state is '${this.state.name}'.`
      );
    }

    this.communicationChannel.sendMessage(initializeWorkerMessage(this.id));
    this.state = new WorkerThreadState("idle");
  }

  /**
   * Executes the given task on the worker.
   * Requires that the worker thread has been initialized
   * @param task the task to execute
   * @param callback the callback to invoke when the task has completed (successful or not)
   */
  public run(task: ITaskDefinition, callback: (error: any, result: any) => void): void {
    if (this.state.name !== "idle") {
      throw new Error(
        `The worker thread can only execute a new task if in state idle but actual state is '${this.state.name}'.`
      );
    }

    this.communicationChannel.sendMessage(scheduleTaskMessage(task));
    const onComplete = (error: any, result: any) => {
      if (!this.stopped) {
        this.state = new WorkerThreadState("idle");
      } else {
        this.state = new WorkerThreadState("stopped");
      }
      callback(error, result);
    };
    this.state = new WorkerThreadExecutingState(onComplete, this.functionLookupTable, this.communicationChannel);
  }

  /**
   * Stops the worker as soon as it receives the message. Does not wait to complete the task.
   */
  public stop(): void {
    if (this.stopped) {
      return;
    }

    this.communicationChannel.sendMessage(stopMessage());
    this.stopped = true;
    if (this.state.name !== "executing") {
      this.state = new WorkerThreadState("stopped");
    }
  }

  public toString(): string {
    return `WorkerThread { id: ${this.id}, state: ${this.state.name}`;
  }

  private onWorkerMessage(message: IWorkerMessage): void {
    this.state.onMessage(message);
  }

  private onError(event: any): void {
    this.state.onError(event);
    this.state = new WorkerThreadState("errored");
  }
}
