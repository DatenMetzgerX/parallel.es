import { SlaveFunctionLookupTable } from "../../../src/common/function/slave-function-lookup-table";
import { functionId } from "../../../src/common/function/function-id";
import { getFunctionName } from "../../../src/common/util/function-name";

describe("SlaveFunctionLookupTable", function() {
  let cache: SlaveFunctionLookupTable;

  beforeEach(function() {
    cache = new SlaveFunctionLookupTable();
  });

  describe("getFunction", function() {
    it("returns undefined if the function is not registered", function() {
      expect(cache.getFunction(functionId("test", 1000))).toBeUndefined();
    });

    it("returns the reference to the registered function in the cache", function() {
      // arrange
      cache.registerFunction({
        argumentNames: ["x"],
        body: "return x;",
        id: functionId("test", 1000)
      });

      // act
      const func = cache.getFunction(functionId("test", 1000));

      // assert
      expect(func).toBeDefined();
      expect(func!(10)).toEqual(10);
    });

    it("returns a named function if the name attribute is set in the definition", function() {
      // arrange
      cache.registerFunction({
        argumentNames: ["x, y, z"],
        body: "return x + z;",
        id: functionId("test", 1000),
        name: "test"
      });

      // act
      const func = cache.getFunction(functionId("test", 1000));

      // assert
      expect(getFunctionName(func!)).toEqual("test");
      expect(func!(5, 10, 5)).toEqual(10);
    });
  });

  describe("registerFunction", function() {
    it("registers the given function definition", function() {
      // act
      cache.registerFunction({
        argumentNames: ["x"],
        body: "return x;",
        id: functionId("test", 1000)
      });

      // assert
      expect(cache.has(functionId("test", 1000))).toBe(true);
    });
  });

  describe("registerStaticFunction", function() {
    it("registers the function using the given id", function() {
      // arrange
      const id = functionId("test", 0);
      const func = () => undefined;

      // act
      cache.registerStaticFunction(id, func);

      // assert
      expect(cache.getFunction(id)).toBe(func);
    });

    it("throws if a function with the given id is already registered", function() {
      // arrange
      const id = functionId("test", 0);
      const func = () => undefined;
      const func2 = () => undefined;
      cache.registerStaticFunction(id, func);

      // act, assert
      expect(() => cache.registerStaticFunction(id, func2)).toThrowError(
        "The given function id 'test-0' is already used by another function registration, the id needs to be unique."
      );
    });
  });
});
