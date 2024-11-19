# `EventManager`

**EventManager** is a library for simplifying event handling in JavaScript. With this package, you can easily manage event subscriptions, remove them, and handle them in a more convenient way.

Main features of this library:

+ Compact and intuitive event handler management.
+ Handling multiple events simultaneously.
+ Type support for custom event objects.

---

## 📦 Installation

```bash
npm install @webeach/event-manager
```

or

```bash
yarn add @webeach/event-manager
```

---

## 🚀 Quick Start

### Subscribing to global `window` events

```js
import { listen } from '@webeach/event-manager';

listen(window)
  .add('resize', () => console.log('Window resized!'))
  .add('scroll', () => console.log('Window scrolled!'));
```

### Subscribing to DOM element events

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

listen(myButton)
  .add('click', () => console.log('Button clicked!'))
  .add('focus', () => console.log('Button focused!'));
```

### Subscribing and removing events

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

const myButtonListener = listen(myButton)
  .add('click', () => console.log('Button clicked!'));

// Unsubscribe from the event after 10 seconds
window.setTimeout(() => {
  myButtonListener.remove('click');
}, 10000);
```

### Custom event manager object

```js
import { listen } from '@webeach/event-manager';

const myListener = listen();

myListener
  .add('test', () => console.log('Event "test" triggered'))
  .add('hello', (event) => console.log(`Hello, ${event.detail.name}!`));

// Trigger events after 3 seconds
window.setTimeout(() => {
  myListener.trigger('test');
  myListener.trigger('hello', {
    name: 'Alex',
  });
}, 3000);
```

### Unsubscribing from all events

```js
import { listen } from '@webeach/event-manager';

const windowListener = listen(window);

windowListener
  .add('focus', () => console.log('Focus event triggered'))
  .add('resize', () => console.log('Resize event triggered'))
  .add('scroll', () => console.log('Scroll event triggered'));

// Unsubscribe from all events after 10 seconds
window.setTimeout(() => {
  windowListener.remove();
  // or: windowListener.remove(['focus', 'resize', 'scroll']);
}, 3000);
```

### Handling multiple events

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

const myButtonListener = listen(myButton);

// Both handlers will be executed
myButtonListener.add('click', () => console.log('Button clicked!'));
myButtonListener.add('click', () => console.log('Button clicked!'));

// Both handlers will be executed
myButtonListener.add('focus', [
  () => console.log('Button focused!'),
  () => console.log('Button focused!'),
]);
```

---

## 🛠 API

The `EventManager` object provides the following methods for managing event handlers:

### `add(type, handler | handler[], options?)`

Adds a new event handler to the listener.

| Parameter | Type                | Description                                                                                                                                          | Example             |
|-----------|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `type`    | `string`            | The type of event.                                                                                                                                   | `"click"`, `"focus` |
| `handler` | `function`, `array` | A function or an array of functions to be executed when the event is triggered. The function also receives the `event` object containing event data. | `(event) => {}`     |
| `options` | `object`            | An optional object with additional settings: `capture` (event capturing phase), `once` (event will be triggered only once).                          |                     |

### `capture(type, handler | handler[])`

A convenient shortcut for `add(type, handler, { capture: true })`.

### `once(type, handler | handler[])`

A convenient shortcut for `add(type, handler, { once: true })`.

### `remove(type | type[])`

Removes event handlers from the listener.

| Parameter | Type                 | Description                                                       | Example                         |
|-----------|----------------------|-------------------------------------------------------------------|---------------------------------|
| `type`    | `string`, `string[]` | The type or array of types of events to remove from the listener. | `"click"`, `["click", "focus"]` |

❗️ Note:
+ This only removes events that were assigned using the listener. Events assigned with addEventListener will be ignored.

### `remove()`

Removes all event handlers from the listener.

❗️ Note:
+ To remove all event handlers from the listener, call `remove` without any parameters.
+ This only removes events that were assigned using the listener. Events assigned with addEventListener will be ignored.

### `trigger(type, detail?)`

Triggers a specific event.

| Parameter | Type     | Description                                   | Example            |
|-----------|----------|-----------------------------------------------|--------------------|
| `type`    | `string` | The type of event to trigger.                 | `"click"`          |
| `detail`  | `object` | An optional object to pass as `event.detail`. | `{ name: 'Alex' }` |

### `trigger(event)`

Triggers a specific event object.

| Parameter | Type    | Description                                       | Example                   |
|-----------|---------|---------------------------------------------------|---------------------------|
| `event`   | `Event` | An event object inherited from the `Event` class. | `new MouseEvent('click')` |

---

## 🧩 Type Support

This package is fully compatible with `TypeScript` and automatically infers the type of events based on the observed object.

You can define your own custom event interface (see example below).

```ts
import { listen } from '@webeach/event-manager';

interface MyCustomGlobalHandlers {
  one: CustomEvent,
  hello: CustomEvent<{ name: string }>,
}

const windowListener = listen<Window, MyCustomGlobalHandlers>(window);

windowListener.add('one', (event) => {
  console.log('Event "one" triggered');
});

windowListener.add('hello', (event) => {
  console.log(`Hello, ${event.detail.name}!`);
});

windowListener.trigger('one');
windowListener.trigger('hello', {
  name: 'Alex',
});
```

---

## 📖 Real Examples

### Text change on `hover`

In this example, the button text changes when hovered.

```ts
import { listen } from '@webeach/event-manager';

const basketButton = document.querySelector('.basket-button') as HTMLButtonElement;

listen(basketButton, {
  mouseenter: () => {
    basketButton.textContent = 'Go to basket';
  },
  mouseleave: () => {
    basketButton.textContent = 'Shopping basket';
  },
})
```

### Tracking clicks on links

This example tracks all clicks on document links to send statistics.

```ts
import { listen } from '@webeach/event-manager';

listen(document)
  .add('click', ({ target }) => {
    const nearestAnchor = target.closest('a') as HTMLAnchorElement | null;
    
    if (
      nearestAnchor !== null &&
      nearestAnchor.href !== '' && (
        nearestAnchor.hostname !== window.location.hostname ||
        nearestAnchor.pathname !== window.location.pathname ||
        nearestAnchor.search !== window.location.search)
    ) {
      window.navigator.sendBeacon(ENV.CLICK_TRACKER_URL, {
        type: 'linkClick',
        data: {
          link: nearestAnchor.href,
        },
      });
    }
  });
```

### Working with `postMessage`

In this example, the `window` listens for a `message` event to adjust the height of an `iframe`.

```ts
import { listen } from '@webeach/event-manager';

const banner = document.getElementById('banner') as HTMLIFrameElement;

const windowListener = listen(window);

windowListener.add('message', (event) => {
  const { type, height } = event.data || {};

  if (type === 'setHeight' && typeof height === 'number') {
    banner.style.height = `${height}px`;
  }
});
```

### Tracking document scroll in `React`

This example shows a `React` component that tracks document scrolling and displays a "scroll to top" button based on the scroll position.

```tsx
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { listen } from '@webeach/event-manager';

const SHOW_TOP_BUTTON_SCROLL_OFFSET = 120;

export const PageLayout: FC<PropsWithChildren> = () => {
  const { children } = props;
    
  const [topButtonShown, setTopButtonShown] = useState(false);
  
  const handleTopButtonClick = () => {
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    const { remove } = listen(window, {
      scroll: () => {
        setTopButtonShown(
          window.scrollY >= SHOW_TOP_BUTTON_SCROLL_OFFSET,
        );
      },
    });
    
    return () => {
      remove();
    };
  }, [topButtonShown]);
  
  return (
    <div className="page-layout">
      <main className="page-layout__content">
        {children}
      </main>
      {topButtonShown && (
        <button
          aria-label="Scroll to top"
          className="page-layout__top-button"
          onClick={handleTopButtonClick}
        />
      )}
    </div>    
  );
};
```

---

## 📄 License

This project is distributed under the MIT License.

---

## 🌐 Languages

+ [🇺🇸 English](./README.md)
+ [🇷🇺 Русский](./README.ru.md)
