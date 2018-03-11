import { ResolvedParallelStream } from "../../../../src/common/parallel/stream/resolved-parallel-stream";
describe("ResolvedParallelStream", function() {
  describe("subscribe", function() {
    it("invokes the complete handler with the value passed in the constructor", function(done) {
      // arrange
      const stream = new ResolvedParallelStream<string, string>("abcd");

      // act
      stream.subscribe(() => undefined, done.fail, result => {
        expect(result).toEqual("abcd");
        done();
      });
    });
  });

  describe("then", function() {
    it("invokes the then handler and not the rejected handler", function(done) {
      // arrange
      const stream = new ResolvedParallelStream<string, string>("abcd");

      // act
      stream.then(done).catch(() => done.fail("a resolved stream can never fail"));
    });
  });

  describe("catch", function() {
    it("does not invoke the catch handler", function(done) {
      // arrange
      const stream = new ResolvedParallelStream<string, string>("abcd");

      // act
      stream.catch(() => done.fail("a resolved stream can never fail"));
      stream.then(done);
    });
  });
});
