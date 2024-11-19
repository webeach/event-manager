import {
  EventManagerCustomEventMap,
  EventManagerEventBaseHandler,
  EventManagerEventTypeKey,
} from './types';

export function validateEventObject(event: unknown): event is Event {
  return event instanceof Event;
}

export function validateEventType<
  CustomEventMap extends EventManagerCustomEventMap,
>(eventType: unknown): eventType is EventManagerEventTypeKey<CustomEventMap> {
  return typeof eventType === 'string' && eventType !== '';
}

export function validateHandler(
  handler: unknown,
): handler is EventManagerEventBaseHandler<Event> {
  return typeof handler === 'function';
}

export function validateHandlerList(
  handlerList: unknown,
): handlerList is
  | EventManagerEventBaseHandler<Event>
  | Array<EventManagerEventBaseHandler<Event>> {
  return Array.isArray(handlerList)
    ? handlerList.every(validateHandler)
    : validateHandler(handlerList);
}

export function validateTargetType(target: any): target is EventTarget {
  // return target instanceof EventTarget
  return (
    typeof target.addEventListener === 'function' &&
    typeof target.removeEventListener === 'function' &&
    typeof target.dispatchEvent === 'function'
  );
}
