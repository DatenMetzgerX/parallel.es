import { WorkerTask } from "../../../src/common/task/worker-task";
import { ITaskDefinition } from "../../../src/common/task/task-definition";
import { functionId } from "../../../src/common/function/function-id";

describe("WorkerTask", function() {
  let workerTask: WorkerTask<number>;

  const taskDefinition: ITaskDefinition = {
    main: {
      ______serializedFunctionCall: true,
      functionId: functionId("test", 2),
      parameters: [5, 10]
    },
    usedFunctionIds: [functionId("test", 2)]
  };

  beforeEach(function() {
    workerTask = new WorkerTask<number>(taskDefinition);
  });

  describe("isCanceled", function() {
    it("is false by default", function() {
      expect(workerTask.isCanceled).toBe(false);
    });

    it("is true if if the task has been resolved", function() {
      // arrange
      workerTask.cancel();

      // act
      workerTask.resolve(10);

      // assert
      expect(workerTask.isCanceled).toBe(true);
    });

    it("is true if if the task has been resolved as canceled", function() {
      // arrange
      workerTask.cancel();

      // act
      workerTask.resolveCancelled();

      // assert
      expect(workerTask.isCanceled).toBe(true);
    });
  });

  describe("isCancellationRequested", function() {
    it("is false by default", function() {
      expect(workerTask.isCancellationRequested).toBe(false);
    });

    it("is true if the user requested cancellation", function() {
      // act
      workerTask.cancel();

      // assert
      expect(workerTask.isCancellationRequested).toBe(true);
    });
  });

  describe("resolve", function() {
    it("triggers the then handlers", function(done) {
      // arrange
      const handler = jasmine.createSpy("thenHandler");
      workerTask.then(handler);

      // act
      workerTask.resolve(10);
      workerTask.then(function() {
        // assert
        expect(handler).toHaveBeenCalledWith(10);
        done();
      }, done.fail);
    });

    it("triggers the catch handlers if the task has been canceled in the meantime", function(done) {
      // arrange
      const catchHandler = jasmine.createSpy("catchHandler");
      workerTask.catch(catchHandler);
      workerTask.cancel();

      // act
      workerTask.resolve(10);
      workerTask.then(() => done.fail("Then handler called, but catch handler should have been called"), function() {
        // assert
        expect(catchHandler).toHaveBeenCalledWith("Task has been canceled");
        expect(workerTask.isCanceled).toBe(true);
        done();
      });
    });
  });

  describe("resolveCanceled", function() {
    it("triggers the catch handlers when the task is resolved canceled", function(done) {
      // arrange
      const catchHandler = jasmine.createSpy("catchHandler");
      workerTask.catch(catchHandler);
      workerTask.cancel();

      // act
      workerTask.resolveCancelled();
      workerTask.then(() => done.fail("Then handler called, but catch handler should have been called"), function() {
        // assert
        expect(catchHandler).toHaveBeenCalledWith("Task has been canceled");
        done();
      });
    });

    it("marks the task as cancelled", function(done) {
      const catchHandler = jasmine.createSpy("catchHandler");
      workerTask.catch(catchHandler);
      workerTask.cancel();

      // act
      workerTask.resolveCancelled();
      workerTask.then(() => done.fail("Then handler called, but catch handler should have been called"), function() {
        // assert
        expect(workerTask.isCanceled).toBe(true);
        done();
      });
    });
  });

  describe("reject", function() {
    it("triggers the catch handlers", function(done) {
      // arrange
      const catchHandler = jasmine.createSpy("catchHandler");
      workerTask.catch(catchHandler);
      workerTask.cancel();

      // act
      workerTask.reject("Error");
      workerTask.then(() => done.fail("Then handler called, but catch handler should have been called"), function() {
        // assert
        expect(catchHandler).toHaveBeenCalledWith("Error");
        done();
      });
    });
  });

  describe("catch", function() {
    let doneFn: DoneFn;
    let unhandledRejctionHandler: () => void;

    beforeEach(function() {
      unhandledRejctionHandler = function() {
        doneFn.fail("Promise has rejection handler and therefore global unrejected handler should not be called");
      };

      window.addEventListener("unhandledrejection", unhandledRejctionHandler);
    });

    afterEach(function() {
      window.removeEventListener("unhandledrejection", unhandledRejctionHandler);
    });

    it("does not trigger 'unhandled exception in promise' if catch handler is registered", function(done) {
      // arrange
      doneFn = done;
      workerTask.catch(() => done());

      // act
      workerTask.reject("Error occurred");
    });
  });
});
