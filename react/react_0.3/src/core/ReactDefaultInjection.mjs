/**
 * @providesModule ReactDefaultInjection
 */

"use strict";

import ReactDOM from './ReactDOM.mjs';
import ReactDOMForm from './ReactDOMForm.mjs';
import DefaultEventPluginOrder from '../eventPlugins/DefaultEventPluginOrder.mjs';
import EnterLeaveEventPlugin from '../eventPlugins/EnterLeaveEventPlugin.mjs';
import EventPluginHub from '../event/EventPluginHub.mjs';
import ReactInstanceHandles from './ReactInstanceHandles.mjs';
import SimpleEventPlugin from '../eventPlugins/SimpleEventPlugin.mjs';

function inject() {
  /**
   * Inject module for resolving DOM hierarchy and plugin ordering.
   */
  EventPluginHub.injection.injectEventPluginOrder(DefaultEventPluginOrder);
  EventPluginHub.injection.injectInstanceHandle(ReactInstanceHandles);

  /**
   * Two important event plugins included by default (without having to require
   * them).
   */
  EventPluginHub.injection.injectEventPluginsByName({
    'SimpleEventPlugin': SimpleEventPlugin,
    'EnterLeaveEventPlugin': EnterLeaveEventPlugin
  });

  /*
   * This is a bit of a hack. We need to override the <form> element
   * to be a composite component because IE8 does not bubble or capture
   * submit to the top level. In order to make this work with our
   * dependency graph we need to inject it here.
   */
  ReactDOM.injection.injectComponentClasses({
    form: ReactDOMForm
  });
}

export default {
  inject: inject
};
