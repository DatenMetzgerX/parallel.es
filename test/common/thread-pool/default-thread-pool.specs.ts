import { DefaultThreadPool } from "../../../src/common/thread-pool/default-thread-pool";
import { ITaskDefinition } from "../../../src/common/task/task-definition";
import { IWorkerThread } from "../../../src/common/worker/worker-thread";
import { WorkerTask } from "../../../src/common/task/worker-task";

describe("DefaultThreadPool", function() {
  let spawn: jasmine.Spy;
  let threadPool: DefaultThreadPool;

  beforeEach(function() {
    spawn = jasmine.createSpy("spawn");

    const workerThreadFactory = { spawn };
    threadPool = new DefaultThreadPool(workerThreadFactory, { maxConcurrencyLevel: 2 });
  });

  describe("maxThreads", function() {
    it("returns the maxConcurrencyLevel constructor argument by default", function() {
      expect(threadPool.maxThreads).toEqual(2);
    });

    it("sets the maxThreads limit", function() {
      // act
      threadPool.maxThreads = 10;

      // assert
      expect(threadPool.maxThreads).toEqual(10);
    });

    it("throws if the value is not a number", function() {
      expect(() => (threadPool.maxThreads = undefined as any)).toThrowError(
        "The maxThreads limit (undefined) has to be a positive integer larger than zero."
      );
    });

    it("throws if the value is not an int", function() {
      expect(() => (threadPool.maxThreads = 2.1)).toThrowError(
        "The maxThreads limit (2.1) has to be a positive integer larger than zero."
      );
    });

    it("throws if the value is negative", function() {
      expect(() => (threadPool.maxThreads = -1)).toThrowError(
        "The maxThreads limit (-1) has to be a positive integer larger than zero."
      );
    });
  });

  describe("run", function() {
    let task: ITaskDefinition;
    let worker1RunSpy: jasmine.Spy;
    let worker1: IWorkerThread;

    beforeEach(function() {
      task = {
        main: { functionId: "test-1" },
        usedFunctionIds: ["test-1"]
      } as any;

      worker1RunSpy = jasmine.createSpy("run");
      worker1 = { run: worker1RunSpy } as any;
      spawn.and.returnValue(worker1);
    });

    it("runs the task on an available worker thread", function() {
      threadPool.run(task);

      // assert
      expect(worker1RunSpy).toHaveBeenCalledWith(task, jasmine.any(Function));
    });

    it("spawns a new worker until the concurrency limit is reached", function() {
      // act
      threadPool.run(task);
      threadPool.run(task);
      threadPool.run(task);

      // assert
      expect(spawn).toHaveBeenCalledTimes(2);
    });

    it("enqueues the task if no worker thread is available", function() {
      // arrange
      const worker2 = { run: jasmine.createSpy("run2"), stop: jasmine.createSpy("stop") };
      spawn.and.returnValues(worker1, worker2);

      // schedule worker until no worker is available...
      threadPool.run(task);
      threadPool.run(task);

      // act, should be queued.
      threadPool.run(task);

      // assert
      expect(worker1RunSpy).toHaveBeenCalledWith(task, jasmine.any(Function));
      expect(worker2.run).toHaveBeenCalledWith(task, jasmine.any(Function));
    });

    it("runs queued tasks when a worker gets available", function() {
      // arrange
      const task2 = Object.create(task);
      const task3 = Object.create(task);

      const worker2 = { run: jasmine.createSpy("run2"), stop: jasmine.createSpy("stop") };
      spawn.and.returnValues(worker1, worker2);

      // schedule worker until no worker is available...
      threadPool.run(task);
      threadPool.run(task2);
      threadPool.run(task3); // queue third task

      // act
      // complete task of first worker so that the third task is scheduled on worker 1
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, undefined, 10);

      // assert
      // task 1 and 3 is executed on worker 1
      expect(worker1RunSpy.calls.count()).toEqual(2);
      expect(worker1RunSpy).toHaveBeenCalledWith(task, jasmine.any(Function));
      expect(worker1RunSpy).toHaveBeenCalledWith(task3, jasmine.any(Function));

      // worker 2 only executes task 2
      expect(worker2.run.calls.count()).toEqual(1);
      expect(worker2.run).toHaveBeenCalledWith(task2, jasmine.any(Function));
    });

    it("reuses an idle worker if available", function() {
      // arrange
      const task2 = Object.create(task);
      const task3 = Object.create(task);

      const worker2 = { run: jasmine.createSpy("run2"), stop: jasmine.createSpy("stop") };
      spawn.and.returnValues(worker1, worker2);

      // spawn all workers by scheduling tasks up to concurrency limit
      threadPool.run(task);
      threadPool.run(task2);

      // complete first task, third task can now be scheduled on worker1 as this worker is idle
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, undefined, 10);

      // act
      threadPool.run(task3);

      expect(worker1RunSpy).toHaveBeenCalledTimes(2);
      expect(worker1RunSpy).toHaveBeenCalledWith(task, jasmine.any(Function));
      expect(worker1RunSpy).toHaveBeenCalledWith(task3, jasmine.any(Function));
    });

    it("resolves the task as canceled if cancellation is requested before the task has been scheduled", function() {
      // arrange
      const canceledTaskDefinition = Object.create(task);

      // schedule tasks to fill queue
      threadPool.run(task);
      threadPool.run(task);
      const canceledTask = threadPool.run(canceledTaskDefinition) as WorkerTask<any>;
      const resolvedCancelledSpy = spyOn(canceledTask, "resolveCancelled");

      canceledTask.cancel();

      // act
      // complete first task to schedule canceled task
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, undefined, 10);

      // assert
      expect(resolvedCancelledSpy).toHaveBeenCalled();
      expect(worker1RunSpy).not.toHaveBeenCalledWith(canceledTaskDefinition, jasmine.any(Function));
    });

    it("runs the next queued task if a task has been cancelled", function() {
      // arrange
      const canceledTaskDefinition = Object.create(task);
      const nextTask = Object.create(task);

      // schedule tasks to fill queue
      threadPool.run(task);
      threadPool.run(task);
      const canceledTask = threadPool.run(canceledTaskDefinition);

      // act
      canceledTask.cancel();
      // complete first task, canceled task is now scheduled on worker 1
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, undefined, 10);

      // assert
      expect(worker1RunSpy).not.toHaveBeenCalledWith(nextTask, jasmine.any(Function));
    });

    it("resolves the task if the computation has completed", function() {
      // arrange
      const scheduledTask = threadPool.run(task) as WorkerTask<any>;
      const resolveSpy = spyOn(scheduledTask, "resolve");

      // act
      // complete task
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, undefined, 10);

      // assert
      expect(resolveSpy).toHaveBeenCalledWith(10);
    });

    it("rejects the task if the computation has failed", function() {
      // arrange
      const scheduledTask = threadPool.run(task) as WorkerTask<any>;
      const rejectSpy = spyOn(scheduledTask, "reject");

      // act
      // complete task
      worker1RunSpy.calls.argsFor(0)[1].call(undefined, "error");

      // assert
      expect(rejectSpy).toHaveBeenCalledWith("error");
    });
  });
});
