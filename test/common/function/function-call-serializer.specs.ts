import { DynamicFunctionRegistry } from "../../../src/common/function/dynamic-function-registry";
import { FunctionCallSerializer } from "../../../src/common/function/function-call-serializer";
import { FunctionCall } from "../../../src/common/function/function-call";
import { IFunctionId } from "../../../src/common/function/function-id";

describe("FunctionCallSerializer", function() {
  let functionRegistry: DynamicFunctionRegistry;
  let serializer: FunctionCallSerializer;
  function testFunction() {
    return 190;
  }

  function parametrizedFunction(arg: number) {
    return arg;
  }

  beforeEach(function() {
    functionRegistry = new DynamicFunctionRegistry();
    serializer = new FunctionCallSerializer(functionRegistry);
  });

  describe("serializeFunctionCall", function() {
    it("looks up the function id in the function registry and returns the serialized call", function() {
      // arrange
      const id: IFunctionId = { identifier: "1", _______isFunctionId: true };
      spyOn(functionRegistry, "getOrSetId").and.returnValue(id);

      // act
      const serialized = serializer.serializeFunctionCall(FunctionCall.create(testFunction));

      // assert
      expect(serialized).not.toBeUndefined();
      expect(serialized.functionId).toBe(id);
      expect(serialized.parameters).toEqual([]);
    });

    it("passes the params in the params array", function() {
      // arrange
      spyOn(functionRegistry, "getOrSetId").and.returnValue(1);

      // act
      const serialized = serializer.serializeFunctionCall(FunctionCall.create(parametrizedFunction, 10));

      // assert
      expect(serialized).not.toBeUndefined();
      expect(serialized.parameters).toEqual([10]);
    });
  });
});
