/**
 * @providesModule OrderedMap
 */

"use strict";

import mixInto from './mixInto.mjs';
import throwIf from '../utils/throwIf.mjs';

var PREFIX = 'key:';

var ARRAY_MUST_CB = 'ARRAY_MUST_CB';
var INVALID_KEY = 'INVALID_KEY';
var DUPLICATE_KEY = 'DUPLICATE_KEY';
var OPERATION_ARGS = 'OPERATION_ARGS';
var RANGE_ARGS = 'RANGE_ARGS';
var NO_EXIST = 'NO_EXIST';

if(true){ //__DEV__
  ARRAY_MUST_CB =
    'If providing an array to an OrderedMap constructor, you must provide ' +
    'a callback that may determine the uniqueue key for each entry. ' +
    'The key that you return from the callback should uniquely define that ' +
    'entity. What is returned from that function must answer the question: ' +
    '"If you were to shuffle the array of entities, how would you be able to ' +
    'determine the identity of the Array entry?"';
  INVALID_KEY =
    'Key must be non-empty, non-null, string or number';
  DUPLICATE_KEY =
    'At creation time, you must extract out IDs that are unique.';
  OPERATION_ARGS =
    'Invalid argument type for construction or operation on OrderedMap. ' +
    'from/merge accepts another OrderedMap. fromArray accepts an Array ' +
    'and a callback to extract a unique ID.';
  RANGE_ARGS =
    'OrderedMap.mapRange requires end of range to be >= start, start to be ' +
    '>= 0 and end < length.';
  NO_EXIST =
    'The requested key does not exist in the OrderedMap';
}

/**
 * Utility to extract a backing object from an initialization `Array`, allowing
 * the caller to assist in resolving the unique ID for each entry via the
 * `keyExtractor` callback. The `keyExtractor` must extract non-empty strings or
 * numbers.
 * @param {Array<Object!>} arr Array of items.
 * @param {function} keyExtractor Extracts a unique key from each item.
 * @return {Object} Map from unique key to originating value that the key was
 * extracted from.
 * @throws Exception if the initialization array has duplicate extracted keys.
 */
function extractObjectFromArray(arr, keyExtractor) {
  var normalizedObj = {};
  for (var i=0; i < arr.length; i++) {
    var item = arr[i];
    var key = keyExtractor(item);
    validatePublicKey(key);
    var normalizedKey = PREFIX + key;
    throwIf(normalizedKey in normalizedObj, DUPLICATE_KEY);
    normalizedObj[normalizedKey] = item;
  }
  return normalizedObj;
}

/**
 * Utility class for mappings with ordering. This class is to be used in an
 * immutable manner. A `OrderedMap` is very much like the native JavaScript
 * object, where keys map to values via the `get()` function. Also, like the
 * native JavaScript object, there is an ordering associated with the mapping.
 * This class is helpful because it eliminates many of the pitfalls that come
 * with the native JavaScript ordered mappings. Specifically, there are
 * inconsistencies with numeric keys in some JavaScript implementations
 * (enumeration ordering). This class protects against those pitfalls and
 * provides functional utilities for dealing with these `OrderedMap`s.
 *
 * - TODO:
 * - orderedMergeExclusive: Merges mutually exclusive `OrderedMap`s.
 * - mapReverse().
 *
 * @class {OrderedMap}
 * @constructor {OrderedMap}
 * @param {Object} normalizedObj Object that is known to be a defensive copy of
 * caller supplied data. We require a defensive copy to guard against callers
 * mutating.  It is also assumed that the keys of `normalizedObj` have been
 * normalized and do not contain any numeric-appearing strings.
 * @param {number} computedLength The precomputed length of `_normalizedObj`
 * keys.
 * @private
 */
function OrderedMapImpl(normalizedObj, computedLength) {
  this._normalizedObj = normalizedObj;
  this._computedPositions = null;
  this.length = computedLength;
}

/**
 * Validates a "public" key - that is, one that the public facing API supplies.
 * The key is then normalized for internal storage. In order to be considered
 * valid, all keys must be non-empty, defined, non-null strings or numbers.
 * Since this already costs a function invocation, will avoid additional call to
 * `throwIf`.
 *
 * @param {string?} key Validates that the key is suitable for use in a
 * `OrderedMap`.
 * @throws Error if key is not appropriate for use in `OrderedMap`.
 */
function validatePublicKey(key) {
  var isEmpty = key === '';
  var correctKeyType = typeof key === 'string' || typeof key === 'number';
  if (isEmpty || !correctKeyType) {
    throw new Error(INVALID_KEY);
  }
}

/**
 * Validates that arguments to range operations are within the correct limits.
 *
 * @param {number} start Start of range.
 * @param {number} length Length of range.
 * @param {number} actualLen Actual length of range that should not be
 * exceeded.
 * @return {void} description
 */
function validateRangeIndices(start, length, actualLen) {
  var startType = typeof start;
  var lengthType = typeof length;
  var invalid =
    startType !== 'number' || lengthType !== 'number' ||
    length < 0 || start < 0 || start + length > actualLen;
  if (invalid) {
    throw new Error(RANGE_ARGS);
  }
}

/**
 * Merges two "normalized" objects (objects who's key have been normalized) into
 * a `OrderedMap`.
 *
 * @param {Object} a Object of key value pairs.
 * @param {Object} b Object of key value pairs.
 * @return {OrderedMap} new `OrderedMap` that results in merging `a` and `b`.
 */
function _fromNormalizedObjects(a, b) {
  // Second optional, both must be a Plain Old JavaScript Object.
  var invalidArgs =
    !a || a.constructor !== Object || (b && b.constructor !== Object);
  throwIf(invalidArgs, OPERATION_ARGS);
  var newSet = {};
  var length = 0;
  var key;
  for (key in a) {
    if (a.hasOwnProperty(key)) {
      newSet[key] = a[key];
      length++;
    }
  }

  for (key in b) {
    if (b.hasOwnProperty(key)) {
      // Increment length if not already added via first object (a)
      if (!(key in newSet)) {
        length++;
      }
      newSet[key] = b[key];
    }
  }
  return new OrderedMapImpl(newSet, length);
}

/**
 * Methods for `OrderedMap` instances.
 *
 * @lends OrderedMap.prototype
 * TODO: Make this data structure lazy, unify with LazyArray.
 * TODO: Unify this with ImmutableObject - it is to be used immutably.
 * TODO: If so, consider providing `fromObject` API.
 * TODO: Create faster implementation of merging/mapping from original Array,
 * without having to first create an object - simply for the sake of merging.
 */
var OrderedMapMethods = {

  /**
   * Returns whether or not a given key is present in the map.
   *
   * @param {string} key Valid string key to lookup membership for.
   * @return {boolean} Whether or not `key` is a member of the map.
   * @throws Error if provided known invalid key.
   */
  has: function(key) {
    validatePublicKey(key);
    var normalizedKey = PREFIX + key;
    return normalizedKey in this._normalizedObj;
  },

  /**
   * Returns the object for a given key, or `undefined` if not present. To
   * distinguish a undefined entry vs not being in the set, use `has()`.
   *
   * @param {string} key String key to lookup the value for.
   * @return {Object?} Object at key `key`, or undefined if not in map.
   * @throws Error if provided known invalid key.
   */
  get: function(key) {
    validatePublicKey(key);
    var normalizedKey = PREFIX + key;
    return this.has(key) ? this._normalizedObj[normalizedKey] : undefined;
  },

  /**
   * Merges, appending new keys to the end of the ordering. Keys in `orderedMap`
   * that are redundant with `this`, maintain the same ordering index that they
   * had in `this`.  This is how standard JavaScript object merging would work.
   * If you wish to prepend a `OrderedMap` to the beginning of another
   * `OrderedMap` then simply reverse the order of operation. This is the analog
   * to `merge(x, y)`.
   *
   * @param {OrderedMap} orderedMap OrderedMap to merge onto the end.
   * @return {OrderedMap} New OrderedMap that represents the result of the
   * merge.
   */
  merge: function(orderedMap) {
    throwIf(!(orderedMap instanceof OrderedMapImpl), OPERATION_ARGS);
    return _fromNormalizedObjects(
      this._normalizedObj,
      orderedMap._normalizedObj
    );
  },

  /**
   * Functional map API. Returns a new `OrderedMap`.
   *
   * @param {Function} cb Callback to invoke for each item.
   * @param {Object?=} context Context to invoke callback from.
   * @returns {OrderedMap} OrderedMap that results from mapping.
   */
  map: function(cb, context) {
    return this.mapRange(cb, 0, this.length, context);
  },

  /**
   * The callback `cb` is invoked with the arguments (item, key,
   * indexInOriginal).
   *
   * @param {Function} cb Determines result for each item.
   * @param {number} start Start index of map range.
   * @param {end} end End index of map range.
   * @param {*!?} context Context of callback invocation.
   * @return {OrderedMap} OrderedMap resulting from mapping the range.
   */
  mapRange: function(cb, start, length, context) {
    var thisSet = this._normalizedObj;
    var newSet = {};
    var i = 0;
    validateRangeIndices(start, length, this.length);
    var end = start + length - 1;
    for (var key in thisSet) {
      if (thisSet.hasOwnProperty(key)) {
        if (i >= start) {
          if (i > end) {
            break;
          }
          var item = thisSet[key];
          newSet[key] = cb.call(context, item, key.substr(PREFIX.length), i);
        }
        i++;
      }
    }
    return new OrderedMapImpl(newSet, length);
  },

  /**
   * Function filter API. Returns new `OrderedMap`.
   *
   * @param {Function} cb Callback to invoke for each item.
   * @param {Object?=} context Context to invoke callback from.
   * @returns {OrderedMap} OrderedMap that results from filtering.
   */
  filter: function(cb, context) {
    return this.filterRange(cb, 0, this.length, context);
  },

  /**
   * The callback `cb` is invoked with the arguments (item, key,
   * indexInOriginal).
   *
   * @param {Function} cb Returns true if item should be in result.
   * @param {number} start Start index of filter range.
   * @param {number} end End index of map range.
   * @param {*!?} context Context of callback invocation.
   * @return {OrderedMap} OrderedMap resulting from filtering the range.
   */
  filterRange: function(cb, start, length, context) {
    var newSet = {};
    var newSetLength = 0;
    this.forEachRange(function(item, key, originalIndex) {
      if (cb.call(context, item, key, originalIndex)) {
        var normalizedKey = PREFIX + key;
        newSet[normalizedKey] = item;
        newSetLength++;
      }
    }, start, length);
    return new OrderedMapImpl(newSet, newSetLength);
  },

  forEach: function(cb, context) {
    this.forEachRange(cb, 0, this.length, context);
  },

  forEachRange: function(cb, start, length, context) {
    validateRangeIndices(start, length, this.length);
    var thisSet = this._normalizedObj;
    var i = 0;
    var end = start + length - 1;
    for (var key in thisSet) {
      if (thisSet.hasOwnProperty(key)) {
        if (i >= start) {
          if (i > end) {
            break;
          }
          var item = thisSet[key];
          cb.call(context, item, key.substr(PREFIX.length), i);
        }
        i++;
      }
    }
  },

  /**
   * Even though `mapRange`/`forEachKeyRange` allow zero length mappings, we'll
   * impose an additional restriction here that the length of mapping be greater
   * than zero - the only reason is that there are many ways to express length
   * zero in terms of two keys and that is confusing.
   */
  mapKeyRange: function(cb, startKey, endKey, context) {
    var startIndex = this.indexOfKey(startKey);
    var endIndex = this.indexOfKey(endKey);
    if (endIndex < startIndex) {
      throw new Error(RANGE_ARGS);
    }
    return this.mapRange(cb, startIndex, (endIndex - startIndex) + 1, context);
  },

  forEachKeyRange: function(cb, startKey, endKey, context) {
    var startIndex = this.indexOfKey(startKey);
    var endIndex = this.indexOfKey(endKey);
    if (endIndex < startIndex) {
      throw new Error(RANGE_ARGS);
    }
    this.forEachRange(cb, startIndex, (endIndex - startIndex) + 1, context);
  },

  /**
   * @param {number} pos Index to search for key at.
   * @return {string|undefined} Either the key at index `pos` or undefined if
   * not in map.
   */
  keyAtIndex: function(pos) {
    var computedPositions = this._getOrComputePositions();
    var keyAtPos = computedPositions.keyByIndex[pos];
    return keyAtPos ? keyAtPos.substr(PREFIX.length) : undefined;
  },

  /**
   * @param {string} key String key from which to find the next key.
   * @return {string|undefined} Either the next key, or undefined if there is no
   * next key.
   * @throws Error if `key` is not in this `OrderedMap`.
   */
  keyAfter: function(key) {
    return this.nthKeyAfter(key, 1);
  },

  /**
   * @param {string} key String key from which to find the preceding key.
   * @return {string|undefined} Either the preceding key, or undefined if there
   * is no preceding.key.
   * @throws Error if `key` is not in this `OrderedMap`.
   */
  keyBefore: function(key) {
    return this.nthKeyBefore(key, 1);
  },

  /**
   * @param {string} key String key from which to find a following key.
   * @param {number} n Distance to scan forward after `key`.
   * @return {string|undefined} Either the nth key after `key`, or undefined if
   * there is no next key.
   * @throws Error if `key` is not in this `OrderedMap`.
   */
  nthKeyAfter: function(key, n) {
    var curIndex = this.indexOfKey(key);
    throwIf(curIndex === undefined, NO_EXIST);
    return this.keyAtIndex(curIndex + n);
  },

  /**
   * @param {string} key String key from which to find a preceding key.
   * @param {number} n Distance to scan backwards before `key`.
   * @return {string|undefined} Either the nth key before `key`, or undefined if
   * there is no previous key.
   * @throws Error if `key` is not in this `OrderedMap`.
   */
  nthKeyBefore: function(key, n) {
    return this.nthKeyAfter(key, -n);
  },

  /**
   * @param {string} key Key to find the index of.
   * @return {number|undefined} Index of the provided key, or `undefined` if the
   * key is not found.
   */
  indexOfKey: function(key) {
    validatePublicKey(key);
    var normalizedKey = PREFIX + key;
    var computedPositions = this._getOrComputePositions();
    var computedPosition = computedPositions.indexByKey[normalizedKey];
    // Just writing it this way to make it clear this is intentional.
    return computedPosition === undefined ? undefined : computedPosition;
  },

  /**
   * @return {Array} An ordered array of this object's values.
   */
  toArray: function() {
    var result = [];
    var thisSet = this._normalizedObj;
    for (var key in thisSet) {
      if (thisSet.hasOwnProperty(key)) {
        result.push(thisSet[key]);
      }
    }
    return result;
  },

  /**
   * Finds the key at a given position, or indicates via `undefined` that that
   * position does not exist in the `OrderedMap`. It is appropriate to return
   * undefined, indicating that the key doesn't exist in the `OrderedMap`
   * because `undefined` is not ever a valid `OrderedMap` key.
   *
   * @private
   * @param {number} pos Position for which we're querying the name.
   * @return {string?} Name of the item at position `pos`, or `undefined` if
   * there is no item at that position.
   */
  _getOrComputePositions: function() {
    // TODO: Entertain computing this at construction time in some less
    // performance critical paths.
    var computedPositions = this._computedPositions;
    if (!computedPositions) {
      this._computePositions();
    }
    return this._computedPositions;
  },

  /**
   * Precomputes the index/key mapping for future lookup. Since `OrderedMap`s
   * are immutable, there is only ever a need to perform this once.
   * @private
   */
  _computePositions: function() {
    this._computedPositions = {
      keyByIndex: {},
      indexByKey: {}
    };
    var keyByIndex = this._computedPositions.keyByIndex;
    var indexByKey = this._computedPositions.indexByKey;
    var index = 0;
    var thisSet = this._normalizedObj;
    for (var key in thisSet) {
      if (thisSet.hasOwnProperty(key)) {
        keyByIndex[index] = key;
        indexByKey[key] = index;
        index++;
      }
    }
  }
};

mixInto(OrderedMapImpl, OrderedMapMethods);

var OrderedMap = {
  from: function(orderedMap) {
    var invalidArg = !(orderedMap instanceof OrderedMapImpl);
    throwIf(invalidArg, OPERATION_ARGS);
    return _fromNormalizedObjects(orderedMap._normalizedObj, null);
  },

  fromArray: function(arr, keyExtractor) {
    throwIf(!Array.isArray(arr), OPERATION_ARGS);
    throwIf(!keyExtractor, ARRAY_MUST_CB);
    return new OrderedMapImpl(
      extractObjectFromArray(arr, keyExtractor),
      arr.length
    );
  }
};

export default OrderedMap;
