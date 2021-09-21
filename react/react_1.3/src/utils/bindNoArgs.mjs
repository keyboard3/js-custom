/**
 * @providesModule bindNoArgs
 */

"use strict";

var bindNoArgs = function (func, context) {
  if (!func) {
    return null;
  }
  return function () {
    return func.call(context);
  };
};

export default bindNoArgs;
