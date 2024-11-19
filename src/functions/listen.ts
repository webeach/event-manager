import {
  EventManager,
  EventManagerCustomEventMap,
  EventManagerHandlerMap,
} from '../modules/EventManager';

export function listen<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
>(
  target: Target | null = null,
  handlers?: EventManagerHandlerMap<Target, CustomEventMap>,
): EventManager<Target, CustomEventMap> {
  if (target === null) {
    return new EventManager<Target, EventManagerCustomEventMap>(
      new EventTarget() as Target,
      handlers,
    );
  }

  return new EventManager<Target, CustomEventMap>(target, handlers);
}
