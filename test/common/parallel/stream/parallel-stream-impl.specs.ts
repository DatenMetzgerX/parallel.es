import { ParallelStream } from "../../../../src/common/parallel/stream/parallel-stream-impl";
import { ResolvedParallelStream } from "../../../../src/common/parallel/stream/resolved-parallel-stream";
import { ITask } from "../../../../src/common/task/task";
import { ScheduledParallelStream } from "../../../../src/common/parallel/stream/scheduled-parallel-stream";
describe("ParallelStreamImpl", function() {
  let next: ((subResult: string, worker: number, valuesPerWorker: number) => void) | undefined;
  let reject: ((reason: any) => void) | undefined;
  let resolve: ((result: number) => void) | undefined;
  let stream: ParallelStream<string, number>;

  beforeEach(function() {
    stream = new ParallelStream((nxt, rsolve, rject) => {
      next = nxt;
      resolve = rsolve;
      reject = rject;
    });
  });

  describe("transform", function() {
    it("applies the given transformer to the result of the input stream", function(done) {
      // arrange
      const transformer = jasmine.createSpy("transformer").and.returnValue(10);
      const transformed = ParallelStream.transform(stream, transformer);

      // act
      resolve!(5);

      // assert
      transformed.then(result => {
        expect(transformer).toHaveBeenCalledWith(5);
        expect(result).toEqual(10);
        done();
      }, done.fail);
    });

    it("triggers the onNext handlers", function() {
      // arrange
      const transformed = ParallelStream.transform(stream, value => value * 2);
      const nextSpy = jasmine.createSpy("next");
      transformed.subscribe(nextSpy);

      // act
      next!("abcd", 0, 10);

      // assert
      expect(nextSpy).toHaveBeenCalledWith("abcd", 0, 10);
    });

    it("triggers the error handlers", function(done) {
      // arrange
      const transformed = ParallelStream.transform(stream, value => value * 2);

      // assert
      transformed.then(() => done.fail("The previous stream failed, the transformed stream needs to fail too"), done);

      // act
      reject!("abcd");
    });
  });

  describe("fromTasks", function() {
    it("returns a resolved parallel stream if the task array is empty", function() {
      // act
      const result = ParallelStream.fromTasks([], "", () => "abcd");

      // assert
      expect(result).toEqual(jasmine.any(ResolvedParallelStream));
    });

    it("returns the default value if the task array is empty", function(done) {
      // act
      const result = ParallelStream.fromTasks([], "ab", () => "abcd");

      // assert
      result.then(res => {
        expect(res).toEqual("ab");
        done();
      });
    });

    it("returns a scheduled parallel stream if the task array is not empty", function() {
      // arrange
      const tasks: ITask<string[]>[] = [jasmine.createSpyObj("task", ["then"])];

      // act
      const result = ParallelStream.fromTasks(tasks, "", () => "abcd");

      // assert
      expect(result).toEqual(jasmine.any(ScheduledParallelStream));
    });
  });

  describe("subscribe", function() {
    it("triggers the registered next handlers if a sub result arrives", function() {
      // arrange
      const nextHandler = jasmine.createSpy("next");
      stream.subscribe(nextHandler);

      // act
      next!("abcd", 0, 10);

      // assert
      expect(nextHandler).toHaveBeenCalledWith("abcd", 0, 10);
    });

    it("triggers the registered error handler if the stream is rejected", function(done) {
      // arrange, assert
      stream.subscribe(() => undefined, done, () =>
        done.fail("The error handler should have been called and not the complete handler")
      );

      // act
      reject!("reason");
    });

    it("triggers the registered complete handler if the stream is resolved", function(done) {
      // arrange
      stream.subscribe(
        () => undefined,
        () => done.fail("The complete handler should have been called since no error occurred"),
        done
      );

      // act
      resolve!(15);
    });
  });

  describe("then", function() {
    it("adds a callback that is triggered when the stream is resolved", function(done) {
      // arrange
      stream.then(done, () => done.fail("The success callback should have been called since no error occurred"));

      // act
      resolve!(15);
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

    it("adds a callback that is triggered when the stream is rejected", function(done) {
      // arrange
      stream
        .then(() => done.fail("The catch callback should have been called since the stream was rejected"))
        .catch(done);

      // act
      reject!("reason");
    });

    it("does not trigger the unhandled rejection if a catch handler is registered", function(done) {
      // arrange
      doneFn = done;
      stream.catch(done);

      // act
      reject!("Reason");
    });
  });
});
