import {
  EventManagerCustomEventMap,
  EventManagerEventBaseHandler,
  EventManagerEventTypeKey,
} from './types';

/** Returns true if the value is an instance of Event. */
export function validateEventObject(event: unknown): event is Event {
  return event instanceof Event;
}

/** Returns true if the value is a non-empty string (valid event type name). */
export function validateEventType<
  CustomEventMap extends EventManagerCustomEventMap,
>(eventType: unknown): eventType is EventManagerEventTypeKey<CustomEventMap> {
  return typeof eventType === 'string' && eventType !== '';
}

/** Returns true if the value is a function (a valid event handler). */
export function validateHandler(
  handler: unknown,
): handler is EventManagerEventBaseHandler<Event> {
  return typeof handler === 'function';
}

/**
 * Returns true if the value is a valid handler or a non-empty array of handlers.
 * Each element of an array is checked individually with validateHandler.
 */
export function validateHandlerList(
  handlerList: unknown,
): handlerList is
  | EventManagerEventBaseHandler<Event>
  | Array<EventManagerEventBaseHandler<Event>> {
  return Array.isArray(handlerList)
    ? handlerList.every(validateHandler)
    : validateHandler(handlerList);
}

/**
 * Returns true if the value implements the EventTarget interface.
 * Checks for addEventListener, removeEventListener, and dispatchEvent methods
 * instead of using instanceof, which does not work across realms.
 */
export function validateTargetType(target: unknown): target is EventTarget {
  if (target === null || typeof target !== 'object') {
    return false;
  }

  const candidate = target as Partial<EventTarget>;

  return (
    typeof candidate.addEventListener === 'function' &&
    typeof candidate.removeEventListener === 'function' &&
    typeof candidate.dispatchEvent === 'function'
  );
}
