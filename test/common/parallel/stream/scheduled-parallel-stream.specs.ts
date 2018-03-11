import { ITask } from "../../../../src/common/task/task";
import { IParallelStream } from "../../../../src/common/parallel";
import { IParallelTaskDefinition } from "../../../../src/common/parallel/parallel-task-definition";
import { ScheduledParallelStream } from "../../../../src/common/parallel/stream/scheduled-parallel-stream";

describe("ScheduledParallelStream", function() {
  let tasks: FakeTask<string>[];
  let task1: FakeTask<string>;
  let task2: FakeTask<string>;
  let task3: FakeTask<string>;
  const joiner = (first: string, second: string) => {
    return (first + " " + second).trim();
  };

  beforeEach(function() {
    tasks = [new FakeTask(0), new FakeTask(1), new FakeTask(2)];
    [task1, task2, task3] = tasks;
  });

  describe("subscribe", function() {
    it("calls the onNext handler for every resolved sub result", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      stream.subscribe(onNextSpy);

      // act
      task1.resolve("Good");
      task2.resolve("Morning");
      task3.resolve("good looking");

      // assert
      setTimeout(function() {
        // wait for next tick
        expect(onNextSpy).toHaveBeenCalledWith("Good", 0, 1);
        expect(onNextSpy).toHaveBeenCalledWith("Morning", 1, 1);
        expect(onNextSpy).toHaveBeenCalledWith("good looking", 2, 1);
        done();
      }, 0);
    });

    it("passes the correct task index even if the tasks are resolved out of order", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      stream.subscribe(onNextSpy);

      // act
      task1.resolve("Good");
      task3.resolve("good looking");
      task2.resolve("Morning");

      // assert
      setTimeout(function() {
        // wait for next tick
        expect(onNextSpy).toHaveBeenCalledWith("Good", 0, 1);
        expect(onNextSpy).toHaveBeenCalledWith("Morning", 1, 1);
        expect(onNextSpy).toHaveBeenCalledWith("good looking", 2, 1);
        done();
      }, 0);
    });

    it("does not trigger the onNext callback after the first task has failed (fail fast)", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      stream.subscribe(onNextSpy);

      // act
      task1.resolve("Good");
      task2.reject("Excuse me, it's already afternoon!");
      task3.resolve("Morning");

      // assert
      setTimeout(function() {
        // wait for next tick
        expect(onNextSpy).toHaveBeenCalledTimes(1);
        done();
      }, 0);
    });

    it("multiple onNext handlers can be registered", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      const onNextSpy2 = jasmine.createSpy("onNext2");
      stream.subscribe(onNextSpy);
      stream.subscribe(onNextSpy2);

      // act
      task1.resolve("Good");
      task2.resolve("morning");
      task3.resolve("good looking");

      // assert
      setTimeout(function() {
        // wait for next tick
        expect(onNextSpy).toHaveBeenCalled();
        expect(onNextSpy2).toHaveBeenCalled();
        done();
      }, 0);
    });

    it("The onError callback is called if a task fails", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      const onError = jasmine.createSpy("onError");
      stream.subscribe(onNextSpy, onError);

      // act
      task1.reject("Hmm...???");

      // assert
      setTimeout(function() {
        expect(onError).toHaveBeenCalledWith("Hmm...???");
        done();
      });
    });

    it("Calls the onComplete handler if all tasks have been completed", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onNextSpy = jasmine.createSpy("onNext");
      const onError = jasmine.createSpy("onError");
      const onComplete = jasmine.createSpy("onComplete");
      stream.subscribe(onNextSpy, onError, onComplete);

      // act
      task1.resolve("Good");
      task2.resolve("morning");
      task3.resolve("good looking");

      // assert
      setTimeout(function() {
        expect(onComplete).toHaveBeenCalledWith("Good morning good looking");
        expect(onComplete).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe("then", function() {
    it("calls the onFulfilled handler if all tasks have been completed", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      const onFulfilled = jasmine.createSpy("onFulfilled");
      const completed = stream.then(onFulfilled);

      // act
      task1.resolve("Good");
      task2.resolve("morning");
      task3.resolve("good looking");

      // assert
      completed.then(
        function() {
          expect(onFulfilled).toHaveBeenCalledWith("Good morning good looking");
          expect(onFulfilled).toHaveBeenCalledTimes(1);
          done();
        },
        function() {
          done.fail("Promise was rejected");
        }
      );
    });

    it("calls the onRejected handler if any tasks failed", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);

      // act
      task1.resolve("Good");
      task2.reject("Excuse me, it's already afternoon!");
      task3.resolve("Morning");

      // assert
      stream.then(
        function() {
          done.fail("The computation of task 2 failed, therefore the promise should have been rejected");
        },
        function(reason) {
          expect(reason).toEqual("Excuse me, it's already afternoon!");
          done();
        }
      );
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

    it("calls the onrejected handler if any task failed", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);

      // act
      task1.resolve("Good");
      task2.reject("Excuse me, it's already afternoon!");
      task3.resolve("Morning");

      // assert
      stream.then(function() {
        done.fail("The computation of task 2 failed, therefore the promise should have been rejected");
      });

      stream.catch(function(reason) {
        expect(reason).toEqual("Excuse me, it's already afternoon!");
        done();
      });
    });

    it("cancels all not yet completed tasks", function(done) {
      // arrange
      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);

      // act
      task1.resolve("Good");
      task2.reject("Excuse me, it's already afternoon!");
      task3.resolve("Morning");

      // assert
      stream.then(function() {
        done.fail("The computation of task 2 failed, therefore the promise should have been rejected");
      });

      stream.catch(function() {
        expect(task3.isCancellationRequested).toBe(true);
        done();
      });
    });

    it("does not trigger 'unhandled exception in promise' if catch handler is registered", function(done) {
      // arrange
      doneFn = done;

      const stream: IParallelStream<string, string> = new ScheduledParallelStream(tasks, "", joiner);
      stream.catch(() => done());

      // act
      task1.resolve("Good");
      task2.reject("Failed");
    });
  });
});

class FakeTask<T> implements ITask<T> {
  public definition: IParallelTaskDefinition;
  public isCanceled = false;
  public isCancellationRequested = false;

  public resolve!: (result: T) => void;
  public reject!: (reason: any) => void;
  private promise: Promise<T>;

  constructor(index: number) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.definition = {
      main: undefined as any,
      taskIndex: index,
      usedFunctionIds: [],
      valuesPerTask: 1
    };
  }

  public cancel() {
    this.isCancellationRequested = true;
  }

  public catch(onrejected?: any): Promise<any> {
    return this.promise.catch(onrejected);
  }

  public then(onfulfilled?: any, onrejected?: any): Promise<any> {
    return this.promise.then(onfulfilled, onrejected);
  }
}
