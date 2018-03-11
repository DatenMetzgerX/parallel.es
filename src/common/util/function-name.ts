/**
 * Returns the name of a function.
 * Function.name contains the name of the function. However, Internet Explorer does not implement this property.
 * Therefore, uses Function.name if defined and otherwise extract the name from source
 * @param func the function for which the name is desired
 * @returns the name of the function or an empty string for an anonymous function
 */
export function getFunctionName(func: Function): string {
  if (func.hasOwnProperty("name")) {
    return func.name;
  }

  const source = func.toString();
  const functionKeywordStart = source.indexOf("function");

  // Arrow Function Expressions
  if (functionKeywordStart === -1) {
    return "";
  }

  return source.substring(functionKeywordStart + 8, source.indexOf("(")).trim();
}
