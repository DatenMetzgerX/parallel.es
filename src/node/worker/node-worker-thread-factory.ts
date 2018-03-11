import { fork } from "child_process";

import { IWorkerThreadFactory } from "../../common/worker/worker-thread-factory";
import { DefaultWorkerThread } from "../../common/worker/default-worker-thread";
import { IWorkerThread } from "../../common/worker/worker-thread";
import { DynamicFunctionRegistry } from "../../common/function/dynamic-function-registry";
import { ChildProcessWorkerThreadSlaveCommunicationChannel } from "./child-process-worker-thread-slave-communication-channel";

export class NodeWorkerThreadFactory implements IWorkerThreadFactory {
  constructor(private functionLookupTable: DynamicFunctionRegistry) {}

  public spawn(): IWorkerThread {
    const child = fork(this.getSlaveFileName());
    const workerThread = new DefaultWorkerThread(
      this.functionLookupTable,
      new ChildProcessWorkerThreadSlaveCommunicationChannel(child)
    );
    workerThread.initialize();
    return workerThread;
  }

  /**
   * Hackedy Hack... Issue is, webpack handles calls to require resolve and replaces the call with the module id
   * but that's not what we want. We actually want the require resolve call to be left until execution.
   * NoParse is neither an option because then no requires / imports are resolved
   * @returns {string} the file name of the slave
   */
  private getSlaveFileName(): string {
    // tslint:disable-next-line:no-eval
    return eval("require").resolve("./parallel-slave");
  }
}
