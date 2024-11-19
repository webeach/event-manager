export type EventManagerAnyHandlerMap = Record<
  string,
  ((event: Event) => void) | ReadonlyArray<(event: Event) => void>
>;

export type EventManagerCustomEventMap = Record<string, Event>;

export type EventManagerCustomHandlerMap<
  CustomEventMap extends EventManagerCustomEventMap,
> = {
  [K in keyof CustomEventMap]?: EventManagerHandlerList<CustomEventMap[K]>;
} & EventManagerAnyHandlerMap;

export type EventManagerEventBaseHandler<EventType extends Event> = (
  event: EventType,
) => void;

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

export type EventManagerEventMap<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = Target extends Window
  ? WindowEventMap
  : Target extends GlobalEventHandlers
    ? GlobalEventHandlersEventMap
    : CustomEventMap;

export type EventManagerEventType<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = keyof EventManagerEventMap<Target, CustomEventMap> | string;

export type EventManagerEventTypeKey<
  CustomEventMap extends EventManagerCustomEventMap,
> =
  | EventManagerWindowEventType
  | EventManagerDOMEventType
  | keyof CustomEventMap
  | string;

export type EventManagerDOMEventType = keyof GlobalEventHandlersEventMap;

export type EventManagerDOMHandlerList<
  EventType extends EventManagerDOMEventType,
> = EventManagerHandlerList<GlobalEventHandlersEventMap[EventType]>;

export type EventManagerDOMHandlerMap = {
  [K in EventManagerDOMEventType]?: EventManagerDOMHandlerList<K>;
} & EventManagerAnyHandlerMap;

export type EventManagerHandlerList<EventType extends Event> =
  | EventManagerEventBaseHandler<EventType>
  | ReadonlyArray<EventManagerEventBaseHandler<EventType>>;

export type EventManagerWindowEventType = keyof WindowEventMap;

export type EventManagerWindowHandlerList<
  EventType extends EventManagerWindowEventType,
> = EventManagerHandlerList<WindowEventMap[EventType]>;

export type EventManagerWindowHandlerMap = {
  [K in EventManagerWindowEventType]?: EventManagerWindowHandlerList<K>;
} & EventManagerAnyHandlerMap;

export type EventManagerHandlerMap<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> = Target extends Window
  ? EventManagerWindowHandlerMap
  : Target extends GlobalEventHandlers
    ? EventManagerDOMHandlerMap
    : EventManagerCustomHandlerMap<CustomEventMap>;

export type EventManagerHandlerOptions = {
  capture?: boolean;
  once?: boolean;
};

export type EventManagerHandlerSerializedMap<
  CustomEventMap extends EventManagerCustomEventMap,
> = Map<
  EventManagerEventTypeKey<CustomEventMap>,
  Array<
    [
      EventManagerEventBaseHandler<Event>,
      Readonly<Required<EventManagerHandlerOptions>>,
    ]
  >
>;
