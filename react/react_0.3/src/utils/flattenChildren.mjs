/**
 * @providesModule flattenChildren
 */

"use strict";

import ReactTextComponent from '../core/ReactTextComponent.mjs';

import escapeTextForBrowser from '../utils/escapeTextForBrowser.mjs';

import throwIf from '../utils/throwIf.mjs';

/**
 * @polyFill Array.isArray
 */


var INVALID_CHILD = 'INVALID_CHILD';
if(true){ //__DEV__
  INVALID_CHILD =
    'You may not pass a child of that type to a React component. It ' +
    'is a common mistake to try to pass a standard browser DOM element ' +
    'as a child of a React component.';
}

var DUPLICATE_KEY_ERROR =
    'You have two children with identical keys. Make sure that you set the ' +
    '"key" property to a unique value such as a row ID.';

/**
 * If there is only a single child, it still needs a name.
 */
var ONLY_CHILD_NAME = '0';

var flattenChildrenImpl = function(res, children, nameSoFar) {
  var key, escapedKey;
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      key = child && (child._key || (child.props && child.props.key));
      escapedKey = key ? escapeTextForBrowser(key) : ('' + i);
      flattenChildrenImpl(
        res,
        child,
        nameSoFar + ':' + escapedKey
      );
    }
  } else {
    var type = typeof children;
    var isOnlyChild = nameSoFar === '';
    var storageName = isOnlyChild ? ONLY_CHILD_NAME : nameSoFar;
    if (children === null || children === undefined || type === 'boolean') {
      res[storageName] = null;
    } else if (children.mountComponentIntoNode) {
      /* We found a component instance */
      if(true){ //__DEV__
        throwIf(res.hasOwnProperty(storageName), DUPLICATE_KEY_ERROR);
      }
      res[storageName] = children;
    } else {
      if (type === 'object') {
        throwIf(children && children.nodeType === 1, INVALID_CHILD);
        for (key in children) {
          if (children.hasOwnProperty(key)) {
            escapedKey = escapeTextForBrowser(key);
            flattenChildrenImpl(
              res,
              children[key],
              nameSoFar + ':' + escapedKey
            );
          }
        }
      } else if (type === 'string') {
        res[storageName] = new ReactTextComponent(children);
      } else if (type === 'number') {
        res[storageName] = new ReactTextComponent('' + children);
      }
    }
  }
};

/**
 * Flattens children that are typically specified as `props.children`.
 * @return {!Object} flattened children keyed by name.
 */
function flattenChildren(children) {
  if (children === null || children === undefined) {
    return children;
  }
  var result = {};
  flattenChildrenImpl(result, children, '');
  return result;
}

export default flattenChildren;
