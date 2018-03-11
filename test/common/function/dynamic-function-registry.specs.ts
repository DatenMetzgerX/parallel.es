import { DynamicFunctionRegistry } from "../../../src/common/function/dynamic-function-registry";
import { functionId } from "../../../src/common/function/function-id";

/* tslint:disable:no-console */

describe("DynamicFunctionRegistry", function() {
  function testFunction(x: number, y: number): void {
    console.log(x + y);
  }

  let functionRegistry: DynamicFunctionRegistry;

  beforeEach(function() {
    functionRegistry = new DynamicFunctionRegistry();
  });

  describe("getOrSetId", function() {
    it("returns a new id for a not yet registered function", function() {
      expect(functionRegistry.getOrSetId(testFunction)).toEqual(functionId("dynamic", 1));
    });

    it("returns the passed in function id if the argument is a function id", function() {
      // arrange
      const id = functionId("dynamic", 1000);

      // act, assert
      expect(functionRegistry.getOrSetId(id)).toBe(id);
    });

    it("returns the same id if the function is already registered", function() {
      // arrange
      const id = functionRegistry.getOrSetId(testFunction);

      // act, assert
      expect(functionRegistry.getOrSetId(testFunction)).toEqual(id);
    });

    it("returns a new id for a function with a different signature or name", function() {
      // arrange
      function testFunction2(x: number, y: number): void {
        console.log(x + y);
      }

      const testFunctionId = functionRegistry.getOrSetId(testFunction);

      // act, assert
      expect(functionRegistry.getOrSetId(testFunction2)).not.toEqual(testFunctionId);
    });
  });

  describe("getDefinition", function() {
    it("returns undefined if the function with the given id is not registered", function() {
      expect(functionRegistry.getDefinition(functionId("test", 1000))).toBeUndefined();
    });

    it("returns the function definition if a function with the given id is registered", function() {
      // arrange
      const id = functionRegistry.getOrSetId(testFunction);

      // act
      const definition = functionRegistry.getDefinition(id);

      // assert
      if (definition) {
        expect(definition.id).toEqual(id);
        expect(definition.argumentNames).toEqual(["x", "y"]);
        expect(definition.name).toEqual("testFunction");
        expect(definition.body).toContain("console.log(x + y)"); // Firefox adds a 'use strict' directive, the other browsers don't
      } else {
        fail("Definition not returned");
      }
    });

    it("does not set the name for an anonymous function", function() {
      // arrange
      const id = functionRegistry.getOrSetId(function(x: number) {
        return x;
      });

      // act
      const definition = functionRegistry.getDefinition(id);

      // assert
      if (definition) {
        expect(definition.id).toEqual(id);
        expect(definition.argumentNames).toEqual(["x"]);
        expect(definition.name).not.toBeDefined();
        expect(definition.body).toContain("return x"); // Firefox adds a 'use strict' directive, the other browsers don't
      } else {
        fail("Definition not returned");
      }
    });
  });
});
