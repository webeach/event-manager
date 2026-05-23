/** A map of event names to their corresponding Event objects for custom events. */
export type EventManagerCustomEventMap = Record<string, Event>;

/**
 * A generic handler map accepting any event name mapped to a handler or handler array.
 *
 * Intersected with strongly-typed maps to allow custom event names on DOM/Window targets
 * (e.g. when listening to user-defined events dispatched via `trigger`).
 */
export type EventManagerAnyHandlerMap = Record<
  string,
  ((event: Event) => void) | ReadonlyArray<(event: Event) => void>
>;

/** Handler map for custom events, constrained to the provided CustomEventMap. */
export type EventManagerCustomHandlerMap<
  CustomEventMap extends EventManagerCustomEventMap,
> = {
  [Key in keyof CustomEventMap]?: EventManagerHandlerList<CustomEventMap[Key]>;
} & EventManagerAnyHandlerMap;

/** A single event handler function for the given Event type. */
export type EventManagerEventBaseHandler<EventType extends Event> = (
  event: EventType,
) => void;

/**
 * Resolves the handler type for a given event type, target, and custom event map.
 * Automatically picks the correct handler list type based on whether the target
 * is Window, a DOM element, or a custom EventTarget.
 */
export type EventManagerEventHandler<
  Target extends EventTarget,
  EventType extends EventManagerEventType<Target, CustomEventMap>,
  CustomEventMap extends EventManagerCustomEventMap,
> = EventType extends EventManagerWindowEventType
  ? EventManagerWindowHandlerList<EventType>
  : EventType extends EventManagerDOMEventType
    ? EventManagerDOMHandlerList<EventType>
    : EventType extends keyof CustomEventMap
      ? EventManagerHandlerList<CustomEventMap[EventType]>
      : EventManagerHandlerList<Event>;

/**
 * Resolves the native event map for a given target.
 * Returns WindowEventMap for Window, GlobalEventHandlersEventMap for DOM elements,
 * and the custom event map otherwise.
 */
export type EventManagerEventMap<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = Target extends Window
  ? WindowEventMap
  : Target extends GlobalEventHandlers
    ? GlobalEventHandlersEventMap
    : CustomEventMap;

/**
 * All possible event type keys for the given target and custom event map.
 *
 * The `(string & {})` intersection preserves IDE autocomplete for known
 * literal keys while still allowing arbitrary string event names.
 */
export type EventManagerEventType<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = keyof EventManagerEventMap<Target, CustomEventMap> | (string & {});

/** Union of all possible event type keys across all supported targets. */
export type EventManagerEventTypeKey<
  CustomEventMap extends EventManagerCustomEventMap,
> =
  | EventManagerWindowEventType
  | EventManagerDOMEventType
  | keyof CustomEventMap
  | (string & {});

/** All known DOM event types from GlobalEventHandlersEventMap. */
export type EventManagerDOMEventType = keyof GlobalEventHandlersEventMap;

/** A handler or handler array for a specific DOM event type. */
export type EventManagerDOMHandlerList<
  EventType extends EventManagerDOMEventType,
> = EventManagerHandlerList<GlobalEventHandlersEventMap[EventType]>;

/** Handler map for DOM element events. */
export type EventManagerDOMHandlerMap = {
  [Key in EventManagerDOMEventType]?: EventManagerDOMHandlerList<Key>;
} & EventManagerAnyHandlerMap;

/** A single handler function or an array of handler functions for the given Event type. */
export type EventManagerHandlerList<EventType extends Event> =
  | EventManagerEventBaseHandler<EventType>
  | ReadonlyArray<EventManagerEventBaseHandler<EventType>>;

/** All known Window event types from WindowEventMap. */
export type EventManagerWindowEventType = keyof WindowEventMap;

/** A handler or handler array for a specific Window event type. */
export type EventManagerWindowHandlerList<
  EventType extends EventManagerWindowEventType,
> = EventManagerHandlerList<WindowEventMap[EventType]>;

/** Handler map for Window events. */
export type EventManagerWindowHandlerMap = {
  [Key in EventManagerWindowEventType]?: EventManagerWindowHandlerList<Key>;
} & EventManagerAnyHandlerMap;

/**
 * Resolves the correct handler map type for the given target.
 * Returns the Window, DOM, or custom handler map accordingly.
 */
export type EventManagerHandlerMap<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = Target extends Window
  ? EventManagerWindowHandlerMap
  : Target extends GlobalEventHandlers
    ? EventManagerDOMHandlerMap
    : EventManagerCustomHandlerMap<CustomEventMap>;

/** Options passed to addEventListener / removeEventListener. */
export type EventManagerHandlerOptions = {
  /** Whether to use the capture phase. @default false */
  capture?: boolean;
  /** Whether the handler should fire at most once. @default false */
  once?: boolean;
  /**
   * Indicates that the handler will never call `preventDefault()`.
   * Allows the browser to optimize scroll/touch event performance.
   * @default false
   */
  passive?: boolean;
};

/**
 * Internal storage map: event type → list of [handler, options] tuples.
 * Used to track registered listeners so they can be removed later.
 */
export type EventManagerSubscriptionMap<
  CustomEventMap extends EventManagerCustomEventMap,
> = Map<
  EventManagerEventTypeKey<CustomEventMap>,
  Array<[EventManagerEventBaseHandler<Event>, EventManagerHandlerOptions]>
>;
