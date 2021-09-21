/**
 * @providesModule escapeTextForBrowser
 */

"use strict";

import throwIf from '../utils/throwIf.mjs';

var ESCAPE_TYPE_ERR;

if(true){ //__DEV__
  ESCAPE_TYPE_ERR =
    'The React core has attempted to escape content that is of a ' +
    'mysterious type (object etc) Escaping only works on numbers and strings';
}

var ESCAPE_LOOKUP = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  "\"": "&quot;",
  "'": "&#x27;",
  "/": "&#x2f;"
};

function escaper(match) {
  return ESCAPE_LOOKUP[match];
}

var escapeTextForBrowser = function (text) {
  var type = typeof text;
  var invalid = type === 'object';
  if(true){ //__DEV__
    throwIf(invalid, ESCAPE_TYPE_ERR);
  }
  if (text === '' || invalid) {
    return '';
  } else {
    if (type === 'string') {
      return text.replace(/[&><"'\/]/g, escaper);
    } else {
      return (''+text).replace(/[&><"'\/]/g, escaper);
    }
  }
};

export default escapeTextForBrowser;
