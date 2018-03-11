import { SlaveFunctionLookupTable } from "../../common/function/slave-function-lookup-table";
import { AbstractWorkerSlave } from "../../common/worker/abstract-worker-slave";

declare function postMessage(data: any): void;

/**
 * Worker thread endpoint executed in the web worker thread.
 * Executes the tasks assigned by the thread pool via the {@link BrowserWorkerThread}.
 */
export class BrowserWorkerSlave extends AbstractWorkerSlave {
  constructor(public functionCache: SlaveFunctionLookupTable) {
    super(functionCache);
  }

  public postMessage(message: any): void {
    postMessage(message);
  }

  protected terminate(): void {
    close();
  }
}
