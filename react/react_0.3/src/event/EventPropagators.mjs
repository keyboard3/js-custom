/**
 * @providesModule EventPropagators
 */

"use strict";

import CallbackRegistry from './CallbackRegistry.mjs';
import EventConstants from '../event/EventConstants.mjs';

import accumulate from '../utils/accumulate.mjs';
import forEachAccumulated from '../utils/forEachAccumulated.mjs';
var getListener = CallbackRegistry.getListener;
var PropagationPhases = EventConstants.PropagationPhases;

/**
 * Injected dependencies:
 */

/**
 * - `InstanceHandle`: [required] Module that performs logical traversals of DOM
 *   hierarchy given ids of the logical DOM elements involved.
 */
var injection = {
  InstanceHandle: null,
  injectInstanceHandle: function(InjectedInstanceHandle) {
    injection.InstanceHandle = InjectedInstanceHandle;
    if(true){ //__DEV__
      injection.validate();
    }
  },
  validate: function() {
    var invalid = !injection.InstanceHandle||
      !injection.InstanceHandle.traverseTwoPhase ||
      !injection.InstanceHandle.traverseEnterLeave;
    if (invalid) {
      throw new Error('InstanceHandle not injected before use!');
    }
  }
};

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(id, abstractEvent, propagationPhase) {
  var registrationName =
    abstractEvent.type.phasedRegistrationNames[propagationPhase];
  return getListener(id, registrationName);
}

/**
 * Tags an `AbstractEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(domID, upwards, abstractEvent) {
  if(true){ //__DEV__
    if (!domID) {
      throw new Error('Dispatching id must not be null');
    }
    injection.validate();
  }
  var phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured;
  var listener = listenerAtPhase(domID, abstractEvent, phase);
  if (listener) {
    abstractEvent._dispatchListeners =
      accumulate(abstractEvent._dispatchListeners, listener);
    abstractEvent._dispatchIDs = accumulate(abstractEvent._dispatchIDs, domID);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We can not perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(abstractEvent) {
  if (abstractEvent && abstractEvent.type.phasedRegistrationNames) {
    injection.InstanceHandle.traverseTwoPhase(
      abstractEvent.abstractTargetID,
      accumulateDirectionalDispatches,
      abstractEvent
    );
  }
}


/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `abstractTargetID` be the same as the dispatched ID.
 */
function accumulateDispatches(id, ignoredDirection, abstractEvent) {
  if (abstractEvent && abstractEvent.type.registrationName) {
    var listener = getListener(id, abstractEvent.type.registrationName);
    if (listener) {
      abstractEvent._dispatchListeners =
        accumulate(abstractEvent._dispatchListeners, listener);
      abstractEvent._dispatchIDs = accumulate(abstractEvent._dispatchIDs, id);
    }
  }
}

/**
 * Accumulates dispatches on an `AbstractEvent`, but only for the
 * `abstractTargetID`.
 * @param {AbstractEvent} abstractEvent
 */
function accumulateDirectDispatchesSingle(abstractEvent) {
  if (abstractEvent && abstractEvent.type.registrationName) {
    accumulateDispatches(abstractEvent.abstractTargetID, null, abstractEvent);
  }
}

function accumulateTwoPhaseDispatches(abstractEvents) {
  if(true){ //__DEV__
    injection.validate();
  }
  forEachAccumulated(abstractEvents, accumulateTwoPhaseDispatchesSingle);
}

function accumulateEnterLeaveDispatches(leave, enter, fromID, toID) {
  if(true){ //__DEV__
    injection.validate();
  }
  injection.InstanceHandle.traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  );
}


function accumulateDirectDispatches(abstractEvents) {
  if(true){ //__DEV__
    injection.validate();
  }
  forEachAccumulated(abstractEvents, accumulateDirectDispatchesSingle);
}



/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing event a
 * single one.
 *
 * @constructor EventPropagators
 */
var EventPropagators = {
  accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
  accumulateDirectDispatches: accumulateDirectDispatches,
  accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches,
  injection: injection
};

export default EventPropagators;
