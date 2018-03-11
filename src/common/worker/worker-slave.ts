import { WorkerSlaveState } from "./worker-slave-states";
import { SlaveFunctionLookupTable } from "../function/slave-function-lookup-table";
import { IWorkerMessage } from "./worker-messages";

export interface IWorkerSlave {
  /**
   * The unique id of the slave instance
   */
  id: number;

  functionCache: SlaveFunctionLookupTable;

  /**
   * Changes the state of the slave to the new state
   * @param state the new state to assign
   */
  changeState(state: WorkerSlaveState): void;

  /**
   * Executed when the slave receives a message from the ui-thread
   * @param event the received message
   */
  onMessage(event: IWorkerMessage): void;

  postMessage(message: any): void;
}
