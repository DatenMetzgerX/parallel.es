import { ParallelEnvironmentDefinition } from "../../../src/common/parallel/parallel-environment-definition";
import { FunctionCall } from "../../../src/common/function/function-call";
import { FunctionCallSerializer } from "../../../src/common/function/function-call-serializer";
describe("ParallelEnvironmentDefinition", function() {
  describe("of", function() {
    it("returns an empty parallel environment if called without an argument", function() {
      expect(ParallelEnvironmentDefinition.of().environments).toEqual([]);
    });

    it("returns a parallel environment containing the passed in environment", function() {
      expect(ParallelEnvironmentDefinition.of({ test: 10 }).environments).toEqual([{ test: 10 }]);
    });
  });

  describe("add", function() {
    it("adds the given environment", function() {
      // arrange
      const definition = ParallelEnvironmentDefinition.of();

      // act, assert
      expect(definition.add({ test: 10 }).environments).toEqual([{ test: 10 }]);
    });

    it("merges subsequent static environments", function() {
      // arrange
      const definition = ParallelEnvironmentDefinition.of({ test: 10 });

      // act, assert
      expect(definition.add({ value: 20 }).environments).toEqual([{ test: 10, value: 20 }]);
    });

    it("does not merge a provider succeeding a static environment", function() {
      // arrange
      const definition = ParallelEnvironmentDefinition.of({ test: 10 });
      const provider = FunctionCall.create(() => ({ value: 20 }));

      // act, assert
      expect(definition.add(provider).environments).toEqual([{ test: 10 }, provider]);
    });

    it("does not merge a static element succeeding a provider", function() {
      // arrange
      const provider = FunctionCall.create(() => ({ value: 20 }));
      const definition = ParallelEnvironmentDefinition.of(provider);

      // act, assert
      expect(definition.add({ test: 10 }).environments).toEqual([provider, { test: 10 }]);
    });

    it("does merge to static environments succeeding a provider", function() {
      // arrange
      const provider = FunctionCall.create(() => ({ value: 20 }));
      const definition = ParallelEnvironmentDefinition.of(provider).add({ name: "Meier" });

      // act, assert
      expect(definition.add({ test: 10 }).environments).toEqual([provider, { name: "Meier", test: 10 }]);
    });

    it("merges the value of equal property names for static environments", function() {
      // arrange
      const definition = ParallelEnvironmentDefinition.of({ name: "Meier" });

      // act, assert
      expect(definition.add({ name: "Müller" }).environments).toEqual([{ name: "Müller" }]);
    });

    it("does not merge succeeding environment providers", function() {
      // arrange
      const provider1 = FunctionCall.create(() => ({ value: 1 }));
      const provider2 = FunctionCall.create(() => ({ value: 2 }));

      const definition = ParallelEnvironmentDefinition.of(provider1);

      // act, assert
      expect(definition.add(provider2).environments).toEqual([provider1, provider2]);
    });
  });

  describe("toJSON", function() {
    let functionCallSerializer: FunctionCallSerializer;
    let serializeSpy: jasmine.Spy;

    beforeEach(function() {
      functionCallSerializer = new FunctionCallSerializer(undefined as any);
      serializeSpy = spyOn(functionCallSerializer, "serializeFunctionCall");
    });

    it("returns a representation of the environments", function() {
      expect(ParallelEnvironmentDefinition.of({ test: 10 }).toJSON(functionCallSerializer)).toEqual([{ test: 10 }]);
    });

    it("serializes the providers with the function call serializer", function() {
      // arrange
      const provider = FunctionCall.create(() => ({ test: 10 }));
      const serializedCall = { functionId: 15 };
      serializeSpy.and.returnValue(serializedCall);

      // act, assert
      expect(ParallelEnvironmentDefinition.of(provider).toJSON(functionCallSerializer)).toEqual([{ functionId: 15 }]);
      expect(serializeSpy).toHaveBeenCalledWith(provider);
    });
  });
});
