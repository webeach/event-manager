import {
  EventManagerCustomEventMap,
  EventManagerEventBaseHandler,
  EventManagerEventHandler,
  EventManagerEventType,
  EventManagerHandlerMap,
  EventManagerHandlerOptions,
  EventManagerSubscriptionMap,
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
  private readonly subscriptions: EventManagerSubscriptionMap<CustomEventMap> =
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
      throw new TypeError('Parameter "target" must be an EventTarget');
    }

    this.target = target;

    // Bound so that methods retain the correct `this` when destructured:
    // const { remove } = listen(button);
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
          // `as never` works around a TS inference limitation with the
          // overloaded conditional handler-map types — runtime is sound.
          this.add(eventType, initialHandlerMap[eventType] as never);
        }
      }
    }
  }

  /**
   * Adds one or more event handlers for the given event type.
   *
   * @param type - The event type to listen for.
   * @param handler - A handler function or array of handler functions.
   * @param options - Optional listener options (capture, once, passive, signal).
   * @returns `this` for chaining.
   * @throws {TypeError} If type is not a non-empty string.
   * @throws {TypeError} If handler is not a function or an array of functions.
   */
  public add<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    type: EventType,
    handler: EventManagerEventHandler<Target, EventType, CustomEventMap>,
    options: EventManagerHandlerOptions = {},
  ) {
    if (!validateEventType<EventManagerCustomEventMap>(type)) {
      throw new TypeError(
        `Parameter "type" must be a non-empty string, got: ${String(type)}`,
      );
    }

    if (!validateHandlerList(handler)) {
      throw new TypeError(
        'Parameter "handler" must be a function or an array of functions',
      );
    }

    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, []);
    }

    // `once` is intentionally excluded — we implement it ourselves below.
    const listenerOptions: EventManagerHandlerOptions = {
      capture: options.capture ?? false,
      passive: options.passive ?? false,
    };

    const handlerList = Array.isArray(handler) ? handler : [handler];

    const targetHandlerList = this.subscriptions.get(type)!;

    handlerList.forEach((originalHandler) => {
      let registeredHandler: EventManagerEventBaseHandler<Event> =
        originalHandler;

      if (options.once) {
        registeredHandler = (event) => {
          this.target.removeEventListener(
            type,
            registeredHandler,
            listenerOptions,
          );
          this.unregisterHandler(type, registeredHandler);
          originalHandler(event);
        };
      }

      targetHandlerList.push([registeredHandler, listenerOptions]);
      this.target.addEventListener(type, registeredHandler, listenerOptions);
    });

    return this;
  }

  /**
   * Adds one or more event handlers using the capture phase.
   * Shorthand for `add(type, handler, { capture: true })`.
   *
   * @param type - The event type to listen for.
   * @param handler - A handler function or array of handler functions.
   * @returns `this` for chaining.
   */
  public capture<
    EventType extends EventManagerEventType<Target, CustomEventMap>,
  >(
    type: EventType,
    handler: EventManagerEventHandler<Target, EventType, CustomEventMap>,
  ) {
    return this.add(type, handler, {
      capture: true,
    });
  }

  /**
   * Adds one or more event handlers that fire at most once.
   * Shorthand for `add(type, handler, { once: true })`.
   *
   * @param type - The event type to listen for.
   * @param handler - A handler function or array of handler functions.
   * @returns `this` for chaining.
   */
  public once<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    type: EventType,
    handler: EventManagerEventHandler<Target, EventType, CustomEventMap>,
  ) {
    return this.add(type, handler, {
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
   * Validation is performed atomically: if any provided type is invalid,
   * a TypeError is thrown before any handler is removed.
   *
   * @param type - The event type, array of event types, or null/undefined to remove all.
   * @returns `this` for chaining.
   * @throws {TypeError} If any provided type is not a non-empty string.
   */
  public remove<
    EventType extends EventManagerEventType<Target, CustomEventMap>,
  >(type: EventType | EventType[] | null = null) {
    if (type === null) {
      this.subscriptions.forEach((handlerList, eventType) => {
        handlerList.forEach(([handler, options]) => {
          // `as never` — see note in constructor.
          this.target.removeEventListener(eventType as never, handler, options);
        });
      });
      this.subscriptions.clear();
      return this;
    }

    const eventTypeList = Array.isArray(type) ? type : [type];

    // Validate all types first so we never end up in a partially-removed state.
    eventTypeList.forEach((eventType) => {
      if (!validateEventType<EventManagerCustomEventMap>(eventType)) {
        throw new TypeError(
          `Parameter "type" must be a non-empty string, got: ${String(eventType)}`,
        );
      }
    });

    eventTypeList.forEach((eventType) => {
      // `as never` — TS cannot reconcile the generic EventType with the
      // subscription map's key type through the conditional `EventManagerEventMap`.
      const handlerList = this.subscriptions.get(eventType as never) ?? null;

      if (handlerList !== null) {
        handlerList.forEach(([handler, options]) => {
          this.target.removeEventListener(eventType as never, handler, options);
        });
        this.subscriptions.delete(eventType as never);
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
  public trigger<
    EventType extends EventManagerEventType<Target, CustomEventMap>,
  >(event: EventType, detail?: unknown): this;
  public trigger(event: Event): this;
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

    throw new TypeError(
      'Parameter "event" must be a non-empty string or an Event instance',
    );
  }

  /**
   * Removes a single handler entry from the internal subscription map.
   * Used by `once`-wrappers and `signal`-abort listeners to keep state consistent.
   */
  private unregisterHandler(
    type: EventManagerEventType<Target, CustomEventMap>,
    handler: EventManagerEventBaseHandler<Event>,
  ) {
    // `as never` — see note in `remove`.
    const handlerList = this.subscriptions.get(type as never);

    if (handlerList === undefined) {
      return;
    }

    const index = handlerList.findIndex(([entry]) => entry === handler);

    if (index !== -1) {
      handlerList.splice(index, 1);
    }

    if (handlerList.length === 0) {
      this.subscriptions.delete(type as never);
    }
  }
}
