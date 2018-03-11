import { isStopMesssage, IWorkerMessage } from "./worker-messages";
import { SlaveFunctionLookupTable } from "../function/slave-function-lookup-table";
import { IWorkerSlave } from "./worker-slave";
import { DefaultWorkerSlaveState, WorkerSlaveState } from "./worker-slave-states";

/**
 * Abstract Worker thread endpoint.
 * Executes the tasks assigned by the thread pool via the {@link DefaultWorkerThread}.
 */
export abstract class AbstractWorkerSlave implements IWorkerSlave {
  /**
   * The unique id of the slave instance
   */
  public id: number = Number.NaN;

  private state: WorkerSlaveState = new DefaultWorkerSlaveState(this);

  constructor(public functionCache: SlaveFunctionLookupTable) {}

  /**
   * Changes the state of the slave to the new state
   * @param state the new state to assign
   */
  public changeState(state: WorkerSlaveState): void {
    this.state = state;
    this.state.enter();
  }

  /**
   * Executed when the slave receives a message from the ui-thread
   * @param message the received message
   */
  public onMessage(message: IWorkerMessage): void {
    if (isStopMesssage(message)) {
      this.terminate();
    } else if (!this.state.onMessage(message)) {
      throw new Error(`Message with type ${message.type} cannot be handled by ${this}`);
    }
  }

  public toString(): string {
    return `Slave { id: ${this.id}, state: '${this.state.name}' }`;
  }

  /**
   * Sends a message to the worker thread of the slave
   * @param message the message to send
   */
  public abstract postMessage(message: any): void;

  /**
   * Terminates / Closes the worker thread
   */
  protected abstract terminate(): void;
}
