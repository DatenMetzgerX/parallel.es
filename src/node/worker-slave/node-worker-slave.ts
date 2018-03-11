import { SlaveFunctionLookupTable } from "../../common/function/slave-function-lookup-table";
import { AbstractWorkerSlave } from "../../common/worker/abstract-worker-slave";
import * as process from "process";

/**
 * Worker thread endpoint executed in the web worker thread.
 * Executes the tasks assigned by the thread pool via the {@link BrowserWorkerThread}.
 */
export class NodeWorkerSlave extends AbstractWorkerSlave {
  // TODO correctly handle shutdown
  constructor(public functionCache: SlaveFunctionLookupTable) {
    super(functionCache);
  }

  public postMessage(message: any): void {
    if (process.send) {
      process.send(message);
    } else {
      throw new Error("Slave not executing inside of a child process");
    }
  }

  protected terminate(): void {
    // not used
  }
}
