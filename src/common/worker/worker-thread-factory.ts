import IWorkerThread from "./worker-thread";

/**
 * Factory that spawns new threads. Abstracts the actual environment (node or browser).
 */
export interface IWorkerThreadFactory {
  /**
   * Spawns a new worker thread
   */
  spawn(): IWorkerThread;
}
