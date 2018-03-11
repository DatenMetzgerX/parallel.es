import { getFunctionName } from "../../../src/common/util/function-name";
describe("getFunctionName", function() {
  it("returns the name of the function", function() {
    // arrange
    function testFunc() {
      return 10;
    }

    // act, assert
    expect(getFunctionName(testFunc)).toEqual("testFunc");
  });

  it("returns an empty string for anonymous functions", function() {
    expect(
      getFunctionName(function() {
        return 10;
      })
    ).toEqual("");
  });

  it("returns an empty string for arrow functions", function() {
    expect(getFunctionName(() => 10)).toEqual("");
  });

  it("returns am empty string even if the function has no space after the function keyword", function() {
    expect(
      getFunctionName(function(memo: any, count: any) {
        return memo + count;
      })
    ).toEqual("");
  });
});
