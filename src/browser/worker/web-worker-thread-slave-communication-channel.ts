import { IWorkerThreadSlaveCommunicationChannel } from "../../common/worker/worker-thread-slave-communication-channel";
import { IWorkerMessage } from "../../common/worker/worker-messages";

export class WebWorkerThreadSlaveCommunicationChannel implements IWorkerThreadSlaveCommunicationChannel {
  constructor(private worker: Worker) {}

  public sendMessage(message: IWorkerMessage): void {
    this.worker.postMessage(message);
  }

  public addEventListener(type: "error" | "message", listener: (ev: any) => any): void {
    if (type === "message") {
      this.worker.addEventListener("message", event => listener(event.data));
    } else if (type === "error") {
      this.worker.addEventListener("error", event => listener(event.error));
    }
  }
}
