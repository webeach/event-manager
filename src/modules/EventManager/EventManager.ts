import {
  EventManagerCustomEventMap,
  EventManagerEventHandler,
  EventManagerEventType,
  EventManagerHandlerMap,
  EventManagerHandlerOptions,
  EventManagerHandlerSerializedMap,
} from './types';
import {
  validateEventObject,
  validateEventType,
  validateHandlerList,
  validateTargetType,
} from './utils';

/**
 * Manages event subscriptions for a given EventTarget.
 *
 * Tracks all registered handlers internally so they can be removed by type
 * or all at once, even when no direct reference to the handler is kept.
 *
 * @template Target - The EventTarget type (Window, HTMLElement, or a custom EventTarget).
 * @template CustomEventMap - A map of custom event names to their Event types.
 *
 * @example
 * const manager = new EventManager(window);
 * manager.add('click', (e) => console.log(e));
 * manager.remove('click');
 */
export class EventManager<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> {
  private readonly handlerSerializedMap: EventManagerHandlerSerializedMap<CustomEventMap> =
    new Map();

  private readonly target: Target;

  /**
   * @param target - The EventTarget to attach events to.
   * @param initialHandlerMap - Optional map of event types to handlers registered immediately.
   * @throws {TypeError} If target does not implement the EventTarget interface.
   */
  constructor(
    target: Target,
    initialHandlerMap: EventManagerHandlerMap<
      Target,
      CustomEventMap
    > | null = null,
  ) {
    if (!validateTargetType(target)) {
      throw new TypeError('Parameter "target" must be a EventTarget');
    }

    this.target = target;

    this.add = this.add.bind(this);
    this.capture = this.capture.bind(this);
    this.once = this.once.bind(this);
    this.remove = this.remove.bind(this);
    this.trigger = this.trigger.bind(this);

    if (initialHandlerMap !== null) {
      for (const eventType in initialHandlerMap) {
        if (
          Object.prototype.hasOwnProperty.call(initialHandlerMap, eventType)
        ) {
          this.add(eventType, initialHandlerMap[eventType] as never);
        }
      }
    }
  }

  /**
   * Adds one or more event handlers for the given event type.
   *
   * @param type - The event type to listen for.
   * @param handlers - A handler function or array of handler functions.
   * @param options - Optional listener options (capture, once).
   * @returns `this` for chaining.
   * @throws {TypeError} If type is not a non-empty string.
   * @throws {TypeError} If handlers is not a function or array of functions.
   */
  public add<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    type: EventType,
    handlers: EventManagerEventHandler<Target, EventType, CustomEventMap>,
    options: EventManagerHandlerOptions = {},
  ) {
    if (!validateEventType<EventManagerCustomEventMap>(type)) {
      throw new TypeError('Parameter "type" must be a Event');
    }

    if (!validateHandlerList(handlers)) {
      throw new TypeError('Parameter "handlers" must be a EventHandlerMap');
    }

    if (!this.handlerSerializedMap.has(type)) {
      this.handlerSerializedMap.set(type, []);
    }

    const finalOptions = Object.freeze<Required<EventManagerHandlerOptions>>({
      capture: options.capture ?? false,
      once: options.once ?? false,
    });

    const eventHandlerList = Array.isArray(handlers) ? handlers : [handlers];

    const targetHandlerList = this.handlerSerializedMap.get(type)!;

    eventHandlerList.forEach((handler) => {
      targetHandlerList.push([handler, finalOptions]);
      this.target.addEventListener(type, handler, finalOptions);
    });

    return this;
  }

  /**
   * Adds one or more event handlers using the capture phase.
   * Shorthand for `add(type, handlers, { capture: true })`.
   *
   * @param type - The event type to listen for.
   * @param handlers - A handler function or array of handler functions.
   * @returns `this` for chaining.
   */
  public capture<
    EventType extends EventManagerEventType<Target, CustomEventMap>,
  >(
    type: EventType,
    handlers: EventManagerEventHandler<Target, EventType, CustomEventMap>,
  ) {
    return this.add(type, handlers, {
      capture: true,
    });
  }

  /**
   * Adds one or more event handlers that fire at most once.
   * Shorthand for `add(type, handlers, { once: true })`.
   *
   * @param type - The event type to listen for.
   * @param handlers - A handler function or array of handler functions.
   * @returns `this` for chaining.
   */
  public once<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    type: EventType,
    handlers: EventManagerEventHandler<Target, EventType, CustomEventMap>,
  ) {
    return this.add(type, handlers, {
      once: true,
    });
  }

  /**
   * Removes event handlers for the given event type(s).
   * Pass no argument (or `null`) to remove all registered handlers.
   *
   * Only removes handlers that were registered through this EventManager instance.
   * Handlers added directly via addEventListener are not affected.
   *
   * @param type - The event type, array of event types, or null/undefined to remove all.
   * @returns `this` for chaining.
   * @throws {TypeError} If any provided type is not a non-empty string.
   */
  public remove<
    EventType extends EventManagerEventType<Target, CustomEventMap>,
  >(type: EventType | EventType[] | null = null) {
    if (type === null) {
      return this.removeAllHandlers();
    }

    const eventTypeList = Array.isArray(type) ? type : [type];

    eventTypeList.forEach((eventType) => {
      if (!validateEventType<EventManagerCustomEventMap>(eventType)) {
        throw new TypeError('Parameter "type" must be a Event');
      }

      const eventHandlerList = this.handlerSerializedMap.get(eventType) ?? null;

      if (eventHandlerList !== null) {
        eventHandlerList.forEach(([handler, options]) => {
          this.target.removeEventListener(eventType, handler, options);
        });
        this.handlerSerializedMap.delete(eventType);
      }
    });

    return this;
  }

  /**
   * Dispatches an event by type name with an optional detail payload,
   * or dispatches an existing Event object directly.
   *
   * @param event - The event type string or an Event instance.
   * @param detail - Optional detail payload (only used when event is a string).
   * @returns `this` for chaining.
   * @throws {TypeError} If the argument is neither a non-empty string nor an Event instance.
   */
  trigger<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    event: EventType,
    detail?: unknown,
  ): this;
  trigger(event: Event): this;
  public trigger(...params: unknown[]) {
    const [event, detail] = params;

    if (validateEventType(event)) {
      this.target.dispatchEvent(new CustomEvent(event, { detail }));
      return this;
    }

    if (validateEventObject(event)) {
      this.target.dispatchEvent(event);
      return this;
    }

    throw new TypeError('Parameter "event" must be a Event');
  }

  /** Removes all registered handlers from the target and clears internal state. */
  private removeAllHandlers() {
    this.handlerSerializedMap.forEach((targetHandlerList, eventType) => {
      targetHandlerList.forEach(([handler, options]) => {
        this.target.removeEventListener(eventType as never, handler, options);
      });
    });

    this.handlerSerializedMap.clear();

    return this;
  }
}
