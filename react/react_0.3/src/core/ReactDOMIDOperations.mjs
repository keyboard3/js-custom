/**
 * @providesModule ReactDOMIDOperations
 * @typechecks
 */

/*jslint evil: true */

"use strict";

import CSSPropertyOperations from '../domUtils/CSSPropertyOperations.mjs';
import DOMChildrenOperations from '../domUtils/DOMChildrenOperations.mjs';
import DOMPropertyOperations from '../domUtils/DOMPropertyOperations.mjs';
import ReactDOMNodeCache from './ReactDOMNodeCache.mjs';

import getTextContentAccessor from '../domUtils/getTextContentAccessor.mjs';
import invariant from '../vendor/core/invariant.mjs';

/**
 * Errors for properties that should not be updated with `updatePropertyById()`.
 *
 * @type {object}
 * @private
 */
var INVALID_PROPERTY_ERRORS = {
  content: '`content` must be set using `updateTextContentByID()`.',
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.'
};

/**
 * The DOM property to use when setting text content.
 *
 * @type {string}
 * @private
 */
var textContentAccessor = getTextContentAccessor() || 'NA';

/**
 * Operations used to process updates to DOM nodes. This is made injectable via
 * `ReactComponent.DOMIDOperations`.
 */
var ReactDOMIDOperations = {

  /**
   * Updates a DOM node with new property values. This should only be used to
   * update DOM properties in `DOMProperty`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} name A valid property name, see `DOMProperty`.
   * @param {*} value New value of the property.
   * @internal
   */
  updatePropertyByID: function (id, name, value) {
    var node = ReactDOMNodeCache.getCachedNodeByID(id);
    invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    );
    DOMPropertyOperations.setValueForProperty(node, name, value);
  },

  /**
   * This should almost never be used instead of `updatePropertyByID()` due to
   * the extra object allocation required by the API. That said, this is useful
   * for batching up several operations across worker thread boundaries.
   *
   * @param {string} id ID of the node to update.
   * @param {object} properties A mapping of valid property names.
   * @internal
   * @see {ReactDOMIDOperations.updatePropertyByID}
   */
  updatePropertiesByID: function (id, properties) {
    for (var name in properties) {
      if (!properties.hasOwnProperty(name)) {
        continue;
      }
      ReactDOMIDOperations.updatePropertiesByID(id, name, properties[name]);
    }
  },

  /**
   * Updates a DOM node with new style values.
   *
   * @param {string} id ID of the node to update.
   * @param {object} styles Mapping from styles to values.
   * @internal
   */
  updateStylesByID: function (id, styles) {
    var node = ReactDOMNodeCache.getCachedNodeByID(id);
    CSSPropertyOperations.setValueForStyles(node, styles);
  },

  /**
   * Updates a DOM node's innerHTML set by `props.dangerouslySetInnerHTML`.
   *
   * @param {string} id ID of the node to update.
   * @param {object} html An HTML object with the `__html` property.
   * @internal
   */
  updateInnerHTMLByID: function (id, html) {
    var node = ReactDOMNodeCache.getCachedNodeByID(id);
    // HACK: IE8- normalize whitespace in innerHTML, removing leading spaces.
    // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html
    node.innerHTML = (html && html.__html || '').replace(/^ /g, '&nbsp;');
  },

  /**
   * Updates a DOM node's text content set by `props.content`.
   *
   * @param {string} id ID of the node to update.
   * @param {string} content Text content.
   * @internal
   */
  updateTextContentByID: function (id, content) {
    var node = ReactDOMNodeCache.getCachedNodeByID(id);
    node[textContentAccessor] = content;
  },

  /**
   * Replaces a DOM node that exists in the document with markup.
   *
   * @param {string} id ID of child to be replaced.
   * @param {string} markup Dangerous markup to inject in place of child.
   * @internal
   * @see {Danger.dangerouslyReplaceNodeWithMarkup}
   */
  dangerouslyReplaceNodeWithMarkupByID: function (id, markup) {
    var node = ReactDOMNodeCache.getCachedNodeByID(id);
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
    ReactDOMNodeCache.purgeEntireCache();
  },

  /**
   * TODO: We only actually *need* to purge the cache when we remove elements.
   *       Detect if any elements were removed instead of blindly purging.
   */
  manageChildrenByParentID: function (parentID, domOperations) {
    var parent = ReactDOMNodeCache.getCachedNodeByID(parentID);
    DOMChildrenOperations.manageChildren(parent, domOperations);
    ReactDOMNodeCache.purgeEntireCache();
  },

  setTextNodeValueAtIndexByParentID: function (parentID, index, value) {
    var parent = ReactDOMNodeCache.getCachedNodeByID(parentID);
    DOMChildrenOperations.setTextNodeValueAtIndex(parent, index, value);
  }

};

export default ReactDOMIDOperations;
