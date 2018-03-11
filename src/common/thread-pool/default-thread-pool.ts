import { IThreadPool } from "./thread-pool";
import { IWorkerThread } from "../worker/worker-thread";
import { ITaskDefinition } from "../task/task-definition";
import { IWorkerThreadFactory } from "../worker/worker-thread-factory";
import { WorkerTask } from "../task/worker-task";
import { ITask } from "../task/task";

/**
 * Default thread pool implementation that processes the scheduled functions in FIFO order.
 */
export class DefaultThreadPool implements IThreadPool {
  private workers: IWorkerThread[] = [];
  private idleWorkers: IWorkerThread[] = [];
  private queue: WorkerTask<any>[] = [];
  private maxThreadsLimit: number;

  public get maxThreads(): number {
    return this.maxThreadsLimit;
  }

  public set maxThreads(limit: number) {
    if (typeof limit !== "number" || limit % 1 !== 0 || limit <= 0) {
      throw new Error(`The maxThreads limit (${limit}) has to be a positive integer larger than zero.`);
    }

    this.maxThreadsLimit = limit;
  }

  constructor(private workerThreadFactory: IWorkerThreadFactory, options: { maxConcurrencyLevel: number }) {
    this.maxThreadsLimit = options.maxConcurrencyLevel;
  }

  public run<TResult>(taskDefinition: ITaskDefinition): ITask<TResult> {
    const task = new WorkerTask<TResult>(taskDefinition);

    this.queue.unshift(task);
    this.schedulePendingTasks();

    return task;
  }

  /**
   * Schedules the tasks in the queue onto the available workers.
   * A new worker is spawned when no more idle workers are available and the number of workers has not yet reached the concurrency limit.
   * If no more idle workers are available and the concurrency limit has been reached then the tasks are left in queue.
   */
  private schedulePendingTasks(): void {
    while (this.queue.length) {
      let worker: IWorkerThread | undefined;
      if (this.idleWorkers.length === 0 && this.workers.length < this.maxThreadsLimit) {
        worker = this.workerThreadFactory.spawn();
        this.workers.push(worker);
      } else if (this.idleWorkers.length > 0) {
        worker = this.idleWorkers.pop();
      }

      if (!worker) {
        return;
      }

      const task = this.queue.pop() as WorkerTask<any>;
      this.runTaskOnWorker(task, worker);
    }
  }

  /**
   * Starts the given task on the given worker. Resolves the task when the computation succeeds, rejects it otherwise.
   * The task is resolved when the computation has succeeded or is rejected if the computation failed
   * @param task the task to run on the given worker
   * @param worker the worker to use to execute the task
   */
  private runTaskOnWorker(task: WorkerTask<any>, worker: IWorkerThread): void {
    if (task.isCancellationRequested) {
      task.resolveCancelled();
      this.releaseWorker(worker);
    } else {
      worker.run(task.definition, (error, result) => {
        if (error) {
          task.reject(error);
        } else {
          task.resolve(result);
        }
        this.releaseWorker(worker);
      });
    }
  }

  private releaseWorker(worker: IWorkerThread): void {
    this.idleWorkers.push(worker);

    this.schedulePendingTasks();
  }
}
