import { SimpleMap } from "../../../src/common/util/simple-map";
describe("SimpleMap", function() {
  let map: SimpleMap<string, string>;

  beforeEach(function() {
    map = new SimpleMap<string, string>();
  });

  describe("set", function() {
    it("adds a new element to the map if the key has not been in the map before", function() {
      // act
      map.set("test", "value");

      // assert
      expect(map.has("test")).toBe(true);
      expect(map.get("test")).toEqual("value");
    });

    it("overrides an existing element in the map", function() {
      // arrange
      map.set("test", "old value");

      // act
      map.set("test", "new value");

      // assert
      expect(map.get("test")).toEqual("new value");
    });
  });

  describe("has", function() {
    it("returns false for not yet existing elements", function() {
      // act, assert
      expect(map.has("test")).toBe(false);
    });
  });

  describe("get", function() {
    it("returns undefined for not existing keys", function() {
      // act, assert
      expect(map.get("test")).toBeUndefined();
    });

    it("does not return internal properties", function() {
      // act, assert
      expect(map.get("constructor")).toBeUndefined();
    });
  });

  describe("clear", function() {
    it("removes all existing registrations", function() {
      // arrange
      map.set("test", "value");

      // act
      map.clear();

      // assert
      expect(map.has("test")).toBe(false);
    });
  });
});
