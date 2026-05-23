import {
  EventManager,
  EventManagerCustomEventMap,
  EventManagerHandlerMap,
} from '../modules/EventManager';

/**
 * Creates an EventManager for the given target, with optional initial handlers.
 *
 * Pass `null` (or call with no arguments) to create a standalone custom event bus
 * backed by a new EventTarget instance.
 *
 * @template Target - The EventTarget type (Window, HTMLElement, or custom EventTarget).
 * @template CustomEventMap - A map of custom event names to their Event types.
 *
 * @param target - The EventTarget to manage events for, or `null` for a custom bus.
 * @param handlers - Optional initial handler map applied immediately after creation.
 * @returns A new EventManager instance bound to the target.
 *
 * @example
 * // Window events
 * listen(window).add('resize', () => console.log('resized'));
 *
 * @example
 * // DOM element events with initial handlers
 * listen(button, { click: () => console.log('clicked') });
 *
 * @example
 * // Custom event bus
 * const bus = listen();
 * bus.add('my-event', (e) => console.log(e.detail));
 * bus.trigger('my-event', { value: 42 });
 */
export function listen<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
>(
  target: Target | null = null,
  handlers?: EventManagerHandlerMap<Target, CustomEventMap>,
): EventManager<Target, CustomEventMap> {
  if (target === null) {
    return new EventManager<Target, CustomEventMap>(
      new EventTarget() as Target,
      handlers,
    );
  }

  return new EventManager<Target, CustomEventMap>(target, handlers);
}
