# `EventManager`

**EventManager** — это пакет для упрощенной работы с событиями в JavaScript. С помощью этого пакета вы сможете легко управлять подписками на события, отключать их и обрабатывать их более удобным способом.

Основные задачи, которые решает данный пакет:

+ Компактное и понятное управление обработчиками событий.
+ Работа с множеством разных событий одновременно.
+ Типизация собственных объектов событий.

---

## 📦 Установка

```bash
npm install @webeach/event-manager
```

или

```bash
yarn add @webeach/event-manager
```

---

## 🚀 Быстрый старт

### Подписка на глобальные события в `window`

```js
import { listen } from '@webeach/event-manager';

listen(window)
  .add('resize', () => console.log('Размер окна был изменён!'))
  .add('scroll', () => console.log('Окно было прокручено!'));
```

### Подписка на события `DOM` элемента.

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

listen(myButton)
  .add('click', () => console.log('Произошёл клик на кнопке!'))
  .add('focus', () => console.log('Произошёл фокус на кнопке!'));
```

### Подписка и удаление событий

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

const myButtonListener = listen(myButton)
  .add('click', () => console.log('Произошёл клик на кнопке!'));

// Отписываемся от события через 10 секунд
window.setTimeout(() => {
  myButtonListener.remove('click');
}, 10000);
```

### Собственный объект управления событиями

```js
import { listen } from '@webeach/event-manager';

const myListener = listen();

myListener
  .add('test', () => console.log('Было вызвано событие "test"'))
  .add('hello', (event) => console.log(`Привет, ${event.detail.name}!`));

// Вызываем события через 3 секунды
window.setTimeout(() => {
  myListener.trigger('test');
  myListener.trigger('hello', {
    name: 'Александр',
  });
}, 3000);
```

### Отписка от всех событий

```js
import { listen } from '@webeach/event-manager';

const windowListener = listen(window);

windowListener
  .add('focus', () => console.log('Было вызвано событие "focus"'))
  .add('resize', () => console.log('Было вызвано событие "resize"'))
  .add('scroll', () => console.log('Было вызвано событие "scroll"'));

// Отписываемся от событий через 10 секунд
window.setTimeout(() => {
  windowListener.remove();
  // либо: windowListener.remove(['focus', 'resize', 'scroll']);
}, 3000);
```

### Множественные события

```js
import { listen } from '@webeach/event-manager';

const myButton = document.getElementById('my-button');

const myButtonListener = listen(myButton);

// Оба обработчика сработают
myButtonListener.add('click', () => console.log('Произошёл клик на кнопке!'));
myButtonListener.add('click', () => console.log('Произошёл клик на кнопке!'));

// Оба обработчика сработают
myButtonListener.add('focus', [
  () => console.log('Произошёл фокус на кнопке!'),
  () => console.log('Произошёл фокус на кнопке!'),
]);
```

---

## 🛠 API

Объект `EventManager` предоставляет следующие методы для работы с обработчиками событий:

### `add(type, handler | handler[], options?)`

Добавляет новый обработчик события в прослушиватель.

| Параметр  | Тип                 | Описание                                                                                                                                                                                                                    | Пример              |
|-----------|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `type`    | `string`            | тип события                                                                                                                                                                                                                 | `"click"`, `"focus` |
| `handler` | `function`, `array` | функция или массив функций, которые будут вызваны при отработке события. Функция также принимает аргумент `event`, который содержит данные о событии.                                                                       | `(event) => {}`     |
| `options` | `object`            | объект дополнительных настроек, который может содержать следующие необязательные `boolean` свойства: `capture` (событие будет перехвачено, актуально для `DOM` событий), `once` (событие будет отработано только один раз). |                     |

### `capture(type, handler | handler[])`

Удобная альтернатива `add(type, handler, { capture: true })`.

### `once(type, handler | handler[])`

Удобная альтернатива `add(type, handler, { once: true })`.

### `remove(type | type[])`

Удаляет обработчики событий из прослушиватель.

| Параметр  | Тип                  | Описание                                                                       | Пример                          |
|-----------|----------------------|--------------------------------------------------------------------------------|---------------------------------|
| `type`    | `string`, `string[]` | тип события или массив типов событий, которые будут удалены из прослушивателя. | `"click"`, `["click", "focus"]` |

❗️ Обратите внимание:
+ Будут удалены только те события, которые были назначены через прослушиватель. События, которые были назначены через `addEventListener` будут проигнорированы.

### `remove()`

Удаляет все обработчики событий из прослушивателя.

❗️ Обратите внимание:
+ Чтобы удалить все обработчики событий из прослушивателя – нужно вызвать `remove` без параметров.
+ Будут удалены только те события, которые были назначены через прослушиватель. События, которые были назначены через `addEventListener` будут проигнорированы.

### `trigger(type, detail?)`

Вызывает указанное событие.

| Параметр | Тип      | Описание                                                                        | Пример                  |
|----------|----------|---------------------------------------------------------------------------------|-------------------------|
| `type`   | `string` | тип события, которое будет вызвано.                                             | `"click"`               |
| `detail` | `object` | необязательный объект, который будет передан в объект события (`event.detail`). | `{ name: 'Анастасия' }` |

### `trigger(event)`

Вызывает указанное событие.

| Параметр | Тип      | Описание                                                                        | Пример                   |
|----------|----------|---------------------------------------------------------------------------------|--------------------------|
| `event`  | `Event`  | объект события наследуемое от объекта `Event`.           | `new MouseEvent('click')` |

---

## 🧩 Типизация

Этот пакет полностью совместим с `typescript` и автоматически определяет тип события, которые зависят от наблюдаемого объекта.

Вы можете типизировать собственный интерфейс пользовательских событий (см. пример ниже).

```ts
import { listen } from '@webeach/event-manager';

interface MyCustomGlobalHandlers {
  one: CustomEvent,
  hello: CustomEvent<{ name: string }>,
}

const windowListener = listen<Window, MyCustomGlobalHandlers>(window);

windowListener.add('one', (event) => {
  console.log('Было вызвано событие "one"');
});

windowListener.add('hello', (event) => {
  console.log(`Привет, ${event.detail.name}!`);
});

windowListener.trigger('one');
windowListener.trigger('hello', {
  name: 'Анастасия',
});
```

---

## 📖 Реальные примеры

### Изменение текста по `hover`

В этом примере мы изменяем текст кнопки при наведении.

```ts
import { listen } from '@webeach/event-manager';

const basketButton = document.querySelector('.basket-button') as HTMLButtonElement;

listen(basketButton, {
  mouseenter: () => {
    basketButton.textContent = 'Перейти в корзину';
  },
  mouseleave: () => {
    basketButton.textContent = 'Корзина покупок';
  },
})
```

### Отслеживание клика по ссылкам

В этом примере мы отслеживаем все клики по ссылкам документа, чтобы отправлять статистику.

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

### Работа с `postmessage`

В этом примере, `window` прослушивает событие `message`, чтобы актуализировать высоту `iframe`.

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

### Отслеживание прокрутки документа в `react`

В этом примере, мы имеем `React` компонент, которые отслеживает прокрутку документ и в зависимости от значения — отображает кнопку прокрутки "наверх".

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
          aria-label="Прокрутить вверх"
          className="page-layout__top-button"
          onClick={handleTopButtonClick}
        />
      )}
    </div>    
  );
};
```

---

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

---

## 🌐 Языки

+ [🇺🇸 English](./README.md)
+ [🇷🇺 Русский](./README.ru.md)
