import { IWorkerThreadSlaveCommunicationChannel } from "../../common/worker/worker-thread-slave-communication-channel";
import { ChildProcess } from "child_process";
import { IWorkerMessage, isStopMesssage } from "../../common/worker/worker-messages";

export class ChildProcessWorkerThreadSlaveCommunicationChannel implements IWorkerThreadSlaveCommunicationChannel {
  constructor(private child: ChildProcess) {}

  public sendMessage(message: IWorkerMessage): void {
    if (isStopMesssage(message)) {
      this.child.kill();
    } else {
      this.child.send(message);
    }
  }

  public addEventListener(type: "error", listener: (ev: any) => any): void;
  public addEventListener(type: "message", listener: (ev: IWorkerMessage) => any): void;
  public addEventListener(type: "error" | "message", listener: (...args: any[]) => void): void {
    this.child.addListener(type, listener);
  }
}
