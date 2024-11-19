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

export class EventManager<
  Target extends EventTarget,
  CustomEventMap extends EventManagerCustomEventMap,
> {
  private readonly handlerSerializedMap: EventManagerHandlerSerializedMap<CustomEventMap> =
    new Map();

  private readonly target: Target;

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

  public once<EventType extends EventManagerEventType<Target, CustomEventMap>>(
    type: EventType,
    handlers: EventManagerEventHandler<Target, EventType, CustomEventMap>,
  ) {
    return this.add(type, handlers, {
      once: true,
    });
  }

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
