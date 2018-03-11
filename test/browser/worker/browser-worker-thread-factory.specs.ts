import { BrowserWorkerThreadFactory } from "../../../src/browser/worker/browser-worker-thread-factory";
import { DynamicFunctionRegistry } from "../../../src/common/function/dynamic-function-registry";
import { IWorkerThread } from "../../../src/common/worker/worker-thread";
import { DefaultWorkerThread } from "../../../src/common/worker/default-worker-thread";

describe("BrowserWorkerThreadFactory", function() {
  let factory: BrowserWorkerThreadFactory;
  let workers: IWorkerThread[];

  beforeEach(function() {
    factory = new BrowserWorkerThreadFactory(new DynamicFunctionRegistry());
    workers = [];
  });

  afterEach(function() {
    workers.forEach(worker => worker.stop());
  });

  describe("spawn", function() {
    it("Spawns a new web worker", function() {
      // act
      const worker = factory.spawn();
      workers.push(worker);

      // assert
      expect(worker).toBeDefined();
    });

    it("Assigns a unique id to each created worker", function() {
      // arrange
      const worker1 = factory.spawn() as DefaultWorkerThread;
      const worker2 = factory.spawn() as DefaultWorkerThread;
      workers.push(worker1, worker2);

      // assert
      expect(worker1.id).not.toBe(worker2.id);
    });
  });
});
