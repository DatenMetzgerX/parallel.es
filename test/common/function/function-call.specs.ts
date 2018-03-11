import { FunctionCall } from "../../../src/common/function/function-call";
describe("FunctionCall", function() {
  describe("create", function() {
    it("returns a function call with the given function and with an empty parameters array", function() {
      // arrange
      const func = () => 10;

      // act
      const call = FunctionCall.create(func);

      // assert
      expect(call.func).toBe(func);
      expect(call.params).toEqual([]);
    });

    it("returns a new function call with the given function and parameters", function() {
      // arrange
      const func = (x: number, y: number) => x + y;

      // act
      const call = FunctionCall.create(func, 10, 15);

      // assert
      expect(call.func).toBe(func);
      expect(call.params).toEqual([10, 15]);
    });
  });

  describe("createUnchecked", function() {
    it("creates a function call with the given function and parameters", function() {
      // arrange
      const func = (x: number, y: number) => x + y;

      // act
      const call = FunctionCall.createUnchecked(func, 10, 15);

      // assert
      expect(call.func).toBe(func);
      expect(call.params).toEqual([10, 15]);
    });
  });
});
