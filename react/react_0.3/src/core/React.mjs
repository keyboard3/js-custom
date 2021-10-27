/**
 * @providesModule React
 */

"use strict";
import ReactCompositeComponent from "./ReactCompositeComponent.mjs";
import ReactComponent from './ReactComponent.mjs';
import ReactDOM from './ReactDOM.mjs';
import ReactMount from './ReactMount.mjs';
import ReactDefaultInjection from './ReactDefaultInjection.mjs';

ReactDefaultInjection.inject();

var React = {
  DOM: ReactDOM,
  initializeTouchEvents: function(shouldUseTouch) {
    ReactMount.useTouchEvents = shouldUseTouch;
  },
  autoBind: ReactCompositeComponent.autoBind,
  createClass: ReactCompositeComponent.createClass,
  createComponentRenderer: ReactMount.createComponentRenderer,
  constructAndRenderComponent: ReactMount.constructAndRenderComponent,
  constructAndRenderComponentByID: ReactMount.constructAndRenderComponentByID,
  renderComponent: ReactMount.renderComponent,
  unmountAndReleaseReactRootNode: ReactMount.unmountAndReleaseReactRootNode,
  isValidComponent: ReactComponent.isValidComponent
};

export default React;
