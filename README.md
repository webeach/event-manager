<div align="center">
  <p>
    <img alt="event-manager" src="./assets/logo.svg" width="640">
  </p>
  <p>
    <a href="https://www.npmjs.com/package/@webeach/event-manager">
      <img src="https://img.shields.io/npm/v/@webeach/event-manager?style=flat-square&labelColor=0A1A3D&color=2E6BFF" alt="npm version" />
    </a>
    <a href="https://github.com/webeach/event-manager/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/webeach/event-manager/ci.yml?style=flat-square&labelColor=0A1A3D&color=2E6BFF" alt="build" />
    </a>
    <a href="https://www.npmjs.com/package/@webeach/event-manager">
      <img src="https://img.shields.io/npm/dw/@webeach/event-manager?style=flat-square&labelColor=0A1A3D&color=2E6BFF" alt="npm downloads" />
    </a>
    <a href="https://github.com/webeach/event-manager/blob/main/LICENSE">
      <img src="https://img.shields.io/npm/l/@webeach/event-manager?style=flat-square&labelColor=0A1A3D&color=2E6BFF" alt="license" />
    </a>
    <a href="https://bundlephobia.com/package/@webeach/event-manager">
      <img src="https://img.shields.io/bundlephobia/minzip/@webeach/event-manager?style=flat-square&labelColor=0A1A3D&color=2E6BFF" alt="bundle size" />
    </a>
  </p>
  <p><a href="./README.md">🇺🇸 English</a> | <a href="./README.ru.md">🇷🇺 Русский</a></p>
  <p>A lightweight library for simplifying event handling in JavaScript and TypeScript.</p>
</div>

---

## 💎 Features

- Compact and intuitive event handler management
- Handle multiple events simultaneously with a single call
- Full TypeScript support with automatic event type inference
- Works with `window`, DOM elements, and custom event buses
- Zero runtime dependencies

---

## 💡 The Problem

Working with native browser events has a few rough edges that add up quickly.

**Removing a listener requires keeping an exact reference to the function.** An anonymous function passed to `addEventListener` can never be removed — you have to store every handler in a variable beforehand:

```js
// ❌ This does nothing — a new function object is created each time
element.addEventListener('click', () => doSomething());
element.removeEventListener('click', () => doSomething());

// ✅ Only this works
function handleClick() {
  doSomething();
}
element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick);
```

**With multiple events, it turns into a lot of boilerplate.** You have to store every reference separately, repeat the target on every line, and then carefully mirror the same calls to remove them:

```js
const handleClick = () => {
  /* ... */
};
const handleFocus = () => {
  /* ... */
};
const handleKeydown = () => {
  /* ... */
};

button.addEventListener('click', handleClick);
button.addEventListener('focus', handleFocus);
button.addEventListener('keydown', handleKeydown);

// Later, to clean up...
button.removeEventListener('click', handleClick);
button.removeEventListener('focus', handleFocus);
button.removeEventListener('keydown', handleKeydown);
```

**Options must match exactly.** If you registered a listener with `{ capture: true }`, you must pass the same option to `removeEventListener` — forget it, and the handler stays attached silently.

**`event-manager` solves this.** It tracks all registered handlers internally, so you never have to hold references yourself. Clean up one event, several, or all of them in a single call:

```js
const listener = listen(button, {
  click: () => {
    /* ... */
  },
  focus: () => {
    /* ... */
  },
  keydown: () => {
    /* ... */
  },
});

// Remove everything — no references, no repetition
listener.remove();
```

---

## 📦 Installation

```bash
npm install @webeach/event-manager
```

```bash
pnpm add @webeach/event-manager
```

```bash
yarn add @webeach/event-manager
```

### Browser via CDN

No build step needed — load directly in the browser via [unpkg](https://unpkg.com) or [jsDelivr](https://www.jsdelivr.com):

```html
<script type="module">
  import { listen } from 'https://unpkg.com/@webeach/event-manager';

  listen(document.getElementById('my-button'))
    .add('click', () => console.log('clicked!'));
</script>
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

const myButtonListener = listen(myButton).add('click', () =>
  console.log('Button clicked!'),
);

// Unsubscribe from the event after 10 seconds
window.setTimeout(() => {
  myButtonListener.remove('click');
}, 10000);
```

### Custom event bus

```js
import { listen } from '@webeach/event-manager';

const myListener = listen();

myListener
  .add('test', () => console.log('Event "test" triggered'))
  .add('hello', (event) => console.log(`Hello, ${event.detail.name}!`));

window.setTimeout(() => {
  myListener.trigger('test');
  myListener.trigger('hello', { name: 'Alex' });
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

window.setTimeout(() => {
  windowListener.remove();
  // or: windowListener.remove(['focus', 'resize', 'scroll']);
}, 3000);
```

### Handling multiple handlers

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');
const myButtonListener = listen(myButton);

// Both handlers will be executed
myButtonListener.add('click', () => console.log('Handler A'));
myButtonListener.add('click', () => console.log('Handler B'));

// Pass an array of handlers at once
myButtonListener.add('focus', [
  () => console.log('Focus handler A'),
  () => console.log('Focus handler B'),
]);
```

---

## 🛠️ API

### `listen(target?, handlers?)`

Creates an `EventManager` for the given target. Pass `null` or no argument to create a standalone custom event bus.

```ts
listen(window);
listen(element, { click: handler });
listen(); // custom event bus
```

### `add(type, handler | handler[], options?)`

Adds one or more event handlers.

| Parameter | Type                     | Description                                       |
| --------- | ------------------------ | ------------------------------------------------- |
| `type`    | `string`                 | Event type name, e.g. `"click"`                   |
| `handler` | `function \| function[]` | Handler function or array of handlers             |
| `options` | `object`                 | Optional: `{ capture?: boolean, once?: boolean }` |

### `capture(type, handler | handler[])`

Shorthand for `add(type, handler, { capture: true })`.

### `once(type, handler | handler[])`

Shorthand for `add(type, handler, { once: true })`.

### `remove(type | type[])`

Removes handlers for the given event type(s). Only affects handlers registered through this instance.

| Parameter | Type                 | Description                            |
| --------- | -------------------- | -------------------------------------- |
| `type`    | `string \| string[]` | Event type or array of types to remove |

### `remove()`

Removes all handlers registered through this instance.

### `trigger(type, detail?)`

Dispatches a `CustomEvent` with the given type and optional detail payload.

| Parameter | Type     | Description                     |
| --------- | -------- | ------------------------------- |
| `type`    | `string` | Event type to dispatch          |
| `detail`  | `any`    | Optional `event.detail` payload |

### `trigger(event)`

Dispatches an existing `Event` object directly.

| Parameter | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| `event`   | `Event` | An Event instance to dispatch |

---

## 🧩 TypeScript

The library is fully typed and automatically infers event types based on the observed target.

```ts
import { listen } from '@webeach/event-manager';

// Window events — fully typed
const windowListener = listen(window);
windowListener.add('resize', (event) => {
  // event is UIEvent
});

// Define custom event types
interface MyEvents {
  hello: CustomEvent<{ name: string }>;
  ping: CustomEvent;
}

const bus = listen<EventTarget, MyEvents>();

bus.add('hello', (event) => {
  console.log(`Hello, ${event.detail.name}!`);
});

bus.trigger('hello', { name: 'Alex' });
```

---

## 📖 Real-world Examples

### Text change on hover

```ts
import { listen } from '@webeach/event-manager';

const basketButton = document.querySelector(
  '.basket-button',
) as HTMLButtonElement;

listen(basketButton, {
  mouseenter: () => {
    basketButton.textContent = 'Go to basket';
  },
  mouseleave: () => {
    basketButton.textContent = 'Shopping basket';
  },
});
```

### Tracking link clicks

```ts
import { listen } from '@webeach/event-manager';

listen(document).add('click', ({ target }) => {
  const anchor = (target as Element).closest('a') as HTMLAnchorElement | null;

  if (
    anchor !== null &&
    anchor.href !== '' &&
    (anchor.hostname !== window.location.hostname ||
      anchor.pathname !== window.location.pathname ||
      anchor.search !== window.location.search)
  ) {
    navigator.sendBeacon('/track', JSON.stringify({ link: anchor.href }));
  }
});
```

### Working with `postMessage`

```ts
import { listen } from '@webeach/event-manager';

const banner = document.getElementById('banner') as HTMLIFrameElement;

listen(window).add('message', (event) => {
  const { type, height } = event.data || {};

  if (type === 'setHeight' && typeof height === 'number') {
    banner.style.height = `${height}px`;
  }
});
```

### Tracking scroll in React

```tsx
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { listen } from '@webeach/event-manager';

const SHOW_TOP_BUTTON_SCROLL_OFFSET = 120;

export const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  const [topButtonShown, setTopButtonShown] = useState(false);

  useEffect(() => {
    const { remove } = listen(window, {
      scroll: () => {
        setTopButtonShown(window.scrollY >= SHOW_TOP_BUTTON_SCROLL_OFFSET);
      },
    });

    return () => {
      remove();
    };
  }, []);

  return (
    <div className="page-layout">
      <main className="page-layout__content">{children}</main>
      {topButtonShown && (
        <button
          aria-label="Scroll to top"
          className="page-layout__top-button"
          onClick={() => window.scrollTo(0, 0)}
        />
      )}
    </div>
  );
};
```

---

## 👨‍💻 Author

Development and support: [Ruslan Martynov](https://github.com/ruslan-mart)

If you have suggestions or found a bug, feel free to open an issue or submit a pull request.

---

## 📄 License

This package is distributed under the [MIT License](./LICENSE).
