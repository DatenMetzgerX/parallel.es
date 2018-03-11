import { identity } from "../../../src/common/util/identity";

describe("identity", function() {
  it("returns the passed in element", function() {
    expect(identity(10)).toBe(10);
  });
});
