import { IWorkerMessage } from "./worker-messages";

/**
 * Communication Channel from the Worker Thread to the Slave
 */
export interface IWorkerThreadSlaveCommunicationChannel {
  sendMessage(message: IWorkerMessage): void;
  addEventListener(type: "error", listener: (this: this, ev: any) => any): void;
  addEventListener(type: "message", listener: (this: this, message: IWorkerMessage) => any): void;
}
