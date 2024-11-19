import { EventManager } from '../../modules/EventManager';
import { listen } from '../listen';

describe('Check the listen function', () => {
  test('should return an instance of the EventManager class', () => {
    const customListener = listen();
    const domListener = listen(document.createElement('div'));
    const windowListener = listen(window);

    expect(customListener).toBeInstanceOf(EventManager);
    expect(domListener).toBeInstanceOf(EventManager);
    expect(windowListener).toBeInstanceOf(EventManager);
  });

  test('should verify that all methods return an instance of the EventManager class', () => {
    const customListener = listen();

    const noop = () => {};

    expect(customListener.add('one', noop)).toBeInstanceOf(EventManager);
    expect(customListener.add('one', [noop, noop])).toBeInstanceOf(
      EventManager,
    );
    expect(customListener.capture('one', noop)).toBeInstanceOf(EventManager);
    expect(customListener.capture('one', [noop, noop])).toBeInstanceOf(
      EventManager,
    );
    expect(customListener.once('one', noop)).toBeInstanceOf(EventManager);
    expect(customListener.once('one', [noop, noop])).toBeInstanceOf(
      EventManager,
    );
    expect(customListener.remove('one')).toBeInstanceOf(EventManager);
    expect(customListener.remove(['one', 'two'])).toBeInstanceOf(EventManager);
    expect(customListener.remove()).toBeInstanceOf(EventManager);
    expect(customListener.trigger('one')).toBeInstanceOf(EventManager);
    expect(customListener.trigger('one', {})).toBeInstanceOf(EventManager);
    expect(customListener.trigger(new CustomEvent('one'))).toBeInstanceOf(
      EventManager,
    );
  });

  test('should verify that an invalid target throws an error', () => {
    // @ts-expect-error: Intentionally passing invalid type for testing
    expect(() => listen({})).toThrow(TypeError);
  });

  test('should verify the event trigger on DOM element click', () => {
    const clickHandler = jest.fn();

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.add('click', clickHandler);

    element.click();

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify the absence of an event on DOM element click', () => {
    const clickHandler = jest.fn();

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.add('click', clickHandler);
    domListener.remove('click');

    element.click();

    expect(clickHandler).toHaveBeenCalledTimes(0);
  });

  test('should verify the triggering of multiple events on DOM element click', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.add('click', clickHandlerList);

    element.click();

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }
  });

  test('should verify the absence of multiple events on DOM element click', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.add('click', clickHandlerList);
    domListener.remove('click');

    element.click();

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify the multiple triggering of an event on DOM element click', () => {
    const clickHandler = jest.fn();

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.add('click', clickHandler);

    for (let i = 0; i < 10; i++) {
      element.click();
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify the triggering of an event with once on DOM element click', () => {
    const clickHandler = jest.fn();

    const element = document.createElement('div');
    const domListener = listen(element);

    domListener.once('click', clickHandler);

    for (let i = 0; i < 10; i++) {
      element.click();
    }

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify different event triggers on the DOM element', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const element = document.createElement('button');
    const domListener = listen(element);

    document.body.append(element);

    domListener.add('click', clickHandler);
    domListener.add('focus', focusHandler);

    element.click();
    element.focus();

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(focusHandler).toHaveBeenCalledTimes(1);

    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify different triggers of multiple events on the DOM element', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    const element = document.createElement('button');
    const domListener = listen(element);

    document.body.append(element);

    domListener.add('click', clickHandlerList);
    domListener.add('focus', focusHandlerList);

    element.click();
    element.focus();

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(FocusEvent));
    }
  });

  test('should verify that the handler map is passed as a parameter for different triggers of multiple events on the DOM element', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    const element = document.createElement('button');

    listen(element, {
      click: clickHandlerList,
      focus: focusHandlerList,
    });

    document.body.append(element);

    element.click();
    element.focus();

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(FocusEvent));
    }
  });

  test('should verify the absence of different multiple event triggers on the DOM element', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    const element = document.createElement('button');
    const domListener = listen(element);

    document.body.append(element);

    domListener.add('click', clickHandlerList);
    domListener.add('focus', focusHandlerList);

    domListener.remove(['click', 'focus']);

    element.click();
    element.focus();

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify different multiple event triggers on the DOM element', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const element = document.createElement('button');
    const domListener = listen(element);

    document.body.append(element);

    domListener.add('click', clickHandler);
    domListener.add('focus', focusHandler);

    for (let i = 0; i < 10; i++) {
      element.click();
      element.focus();
      element.blur();
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(10);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify that the handler map is passed as a parameter for different multiple event triggers on the DOM element', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const element = document.createElement('button');

    listen(element, {
      click: clickHandler,
      focus: focusHandler,
    });

    document.body.append(element);

    for (let i = 0; i < 10; i++) {
      element.click();
      element.focus();
      element.blur();
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(10);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify different multiple event triggers with once on the DOM element', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const element = document.createElement('button');
    const domListener = listen(element);

    document.body.append(element);

    domListener.once('click', clickHandler);
    domListener.once('focus', focusHandler);

    for (let i = 0; i < 10; i++) {
      element.click();
      element.focus();
      element.blur();
    }

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(1);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify the event trigger on window click', () => {
    const clickHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.add('click', clickHandler);

    window.dispatchEvent(new MouseEvent('click'));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify the absence of an event on window click', () => {
    const clickHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.add('click', clickHandler);
    windowListener.remove('click');

    window.dispatchEvent(new MouseEvent('click'));

    expect(clickHandler).toHaveBeenCalledTimes(0);
  });

  test('should verify the triggering of multiple events on window click', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());

    const windowListener = listen(window);

    windowListener.add('click', clickHandlerList);

    window.dispatchEvent(new MouseEvent('click'));

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }
  });

  test('should verify the absence of multiple events on window click', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());

    const windowListener = listen(window);

    windowListener.add('click', clickHandlerList);
    windowListener.remove('click');

    window.dispatchEvent(new MouseEvent('click'));

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify the multiple triggering of an event on window click', () => {
    const clickHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.add('click', clickHandler);

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('click'));
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify the triggering of an event with once on window click', () => {
    const clickHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.once('click', clickHandler);

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('click'));
    }

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
  });

  test('should verify different event triggers on the window', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.add('click', clickHandler);
    windowListener.add('focus', focusHandler);

    window.dispatchEvent(new MouseEvent('click'));
    window.dispatchEvent(new FocusEvent('focus'));

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(focusHandler).toHaveBeenCalledTimes(1);

    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify different triggers of multiple events on the window', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    const windowListener = listen(window);

    windowListener.add('click', clickHandlerList);
    windowListener.add('focus', focusHandlerList);

    window.dispatchEvent(new MouseEvent('click'));
    window.dispatchEvent(new FocusEvent('focus'));

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(FocusEvent));
    }
  });

  test('should verify that the handler map is passed as a parameter for different triggers of multiple events on the window', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    listen(window, {
      click: clickHandlerList,
      focus: focusHandlerList,
    });

    window.dispatchEvent(new MouseEvent('click'));
    window.dispatchEvent(new FocusEvent('focus'));

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(FocusEvent));
    }
  });

  test('should verify the absence of different multiple event triggers on the window', () => {
    const clickHandlerList = Array.from(Array(10), () => jest.fn());
    const focusHandlerList = Array.from(Array(10), () => jest.fn());

    const windowListener = listen(window);

    windowListener.add('click', clickHandlerList);
    windowListener.add('focus', focusHandlerList);

    windowListener.remove(['click', 'focus']);

    window.dispatchEvent(new MouseEvent('click'));
    window.dispatchEvent(new FocusEvent('focus'));

    for (const handler of clickHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }

    for (const handler of focusHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify different multiple event triggers on the window', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.add('click', clickHandler);
    windowListener.add('focus', focusHandler);

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('click'));
      window.dispatchEvent(new FocusEvent('focus'));
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(10);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify that the handler map is passed as a parameter for different multiple event triggers on the window', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    listen(window, {
      click: clickHandler,
      focus: focusHandler,
    });

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('click'));
      window.dispatchEvent(new FocusEvent('focus'));
    }

    expect(clickHandler).toHaveBeenCalledTimes(10);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(10);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify different multiple event triggers with once on the window', () => {
    const clickHandler = jest.fn();
    const focusHandler = jest.fn();

    const windowListener = listen(window);

    windowListener.once('click', clickHandler);
    windowListener.once('focus', focusHandler);

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('click'));
      window.dispatchEvent(new FocusEvent('focus'));
    }

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(expect.any(MouseEvent));

    expect(focusHandler).toHaveBeenCalledTimes(1);
    expect(focusHandler).toHaveBeenCalledWith(expect.any(FocusEvent));
  });

  test('should verify the event trigger on custom listener', () => {
    const customHandler = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandler);

    customListener.trigger('one');

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify the absence of an event on custom listener', () => {
    const customHandler = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandler);
    customListener.remove('one');

    customListener.trigger('one');

    expect(customHandler).toHaveBeenCalledTimes(0);
  });

  test('should verify the triggering of multiple events on custom listener', () => {
    const customHandlerList = Array.from(Array(10), () => jest.fn());

    const customListener = listen();

    customListener.add('one', customHandlerList);

    customListener.trigger('one');

    for (const handler of customHandlerList) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));
    }
  });

  test('should verify the absence of multiple events on custom listener', () => {
    const customHandlerList = Array.from(Array(10), () => jest.fn());

    const customListener = listen();

    customListener.add('one', customHandlerList);
    customListener.remove('one');

    customListener.trigger('one');

    for (const handler of customHandlerList) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify the multiple triggering of an event on custom listener', () => {
    const customHandlerList = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandlerList);

    for (let i = 0; i < 10; i++) {
      customListener.trigger('one');
    }

    expect(customHandlerList).toHaveBeenCalledTimes(10);
    expect(customHandlerList).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify the triggering of an event with once on custom listener', () => {
    const customHandler = jest.fn();

    const customListener = listen();

    customListener.once('one', customHandler);

    for (let i = 0; i < 10; i++) {
      customListener.trigger('one');
    }

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify different event triggers on custom listener', () => {
    const customHandlerOne = jest.fn();
    const customHandlerTwo = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandlerOne);
    customListener.add('two', customHandlerTwo);

    customListener.trigger('one');
    customListener.trigger('two');

    expect(customHandlerOne).toHaveBeenCalledTimes(1);
    expect(customHandlerTwo).toHaveBeenCalledTimes(1);

    expect(customHandlerOne).toHaveBeenCalledWith(expect.any(CustomEvent));
    expect(customHandlerTwo).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify different triggers of multiple events on custom listener', () => {
    const customHandlerListOne = Array.from(Array(10), () => jest.fn());
    const customHandlerListTwo = Array.from(Array(10), () => jest.fn());

    const customListener = listen();

    customListener.add('one', customHandlerListOne);
    customListener.add('two', customHandlerListTwo);

    customListener.trigger('one');
    customListener.trigger('two');

    for (const handler of customHandlerListOne) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));
    }

    for (const handler of customHandlerListTwo) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));
    }
  });

  test('should verify that the handler map is passed as a parameter for different triggers of multiple events on custom listener', () => {
    const customHandlerListOne = Array.from(Array(10), () => jest.fn());
    const customHandlerListTwo = Array.from(Array(10), () => jest.fn());

    const customListener = listen(null, {
      one: customHandlerListOne,
      two: customHandlerListTwo,
    });

    customListener.trigger('one');
    customListener.trigger('two');

    for (const handler of customHandlerListOne) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));
    }

    for (const handler of customHandlerListTwo) {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(expect.any(CustomEvent));
    }
  });

  test('should verify the absence of different multiple event triggers on custom listener', () => {
    const customHandlerListOne = Array.from(Array(10), () => jest.fn());
    const customHandlerListTwo = Array.from(Array(10), () => jest.fn());

    const customListener = listen();

    customListener.add('one', customHandlerListOne);
    customListener.add('two', customHandlerListTwo);

    customListener.remove(['one', 'two']);

    customListener.trigger('one');
    customListener.trigger('two');

    for (const handler of customHandlerListOne) {
      expect(handler).toHaveBeenCalledTimes(0);
    }

    for (const handler of customHandlerListTwo) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify the absence of multiple different event triggers on a custom listener when all events are removed without specifying individual ones.', () => {
    const customHandlerListOne = Array.from(Array(10), () => jest.fn());
    const customHandlerListTwo = Array.from(Array(10), () => jest.fn());

    const customListener = listen();

    customListener.add('one', customHandlerListOne);
    customListener.add('two', customHandlerListTwo);

    customListener.remove();

    customListener.trigger('one');
    customListener.trigger('two');

    for (const handler of customHandlerListOne) {
      expect(handler).toHaveBeenCalledTimes(0);
    }

    for (const handler of customHandlerListTwo) {
      expect(handler).toHaveBeenCalledTimes(0);
    }
  });

  test('should verify different multiple event triggers on custom listener', () => {
    const customHandlerOne = jest.fn();
    const customHandlerTwo = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandlerOne);
    customListener.add('two', customHandlerTwo);

    for (let i = 0; i < 10; i++) {
      customListener.trigger('one');
      customListener.trigger('two');
    }

    expect(customHandlerOne).toHaveBeenCalledTimes(10);
    expect(customHandlerOne).toHaveBeenCalledWith(expect.any(CustomEvent));

    expect(customHandlerTwo).toHaveBeenCalledTimes(10);
    expect(customHandlerTwo).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify that the handler map is passed as a parameter for different multiple event triggers on custom listener', () => {
    const customHandlerOne = jest.fn();
    const customHandlerTwo = jest.fn();

    const customListener = listen(null, {
      one: customHandlerOne,
      two: customHandlerTwo,
    });

    for (let i = 0; i < 10; i++) {
      customListener.trigger('one');
      customListener.trigger('two');
    }

    expect(customHandlerOne).toHaveBeenCalledTimes(10);
    expect(customHandlerOne).toHaveBeenCalledWith(expect.any(CustomEvent));

    expect(customHandlerTwo).toHaveBeenCalledTimes(10);
    expect(customHandlerTwo).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify different multiple event triggers with once on custom listener', () => {
    const customHandlerOne = jest.fn();
    const customHandlerTwo = jest.fn();

    const customListener = listen();

    customListener.once('one', customHandlerOne);
    customListener.once('two', customHandlerTwo);

    for (let i = 0; i < 10; i++) {
      customListener.trigger('one');
      customListener.trigger('two');
    }

    expect(customHandlerOne).toHaveBeenCalledTimes(1);
    expect(customHandlerOne).toHaveBeenCalledWith(expect.any(CustomEvent));

    expect(customHandlerTwo).toHaveBeenCalledTimes(1);
    expect(customHandlerTwo).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify the event trigger with an object passed on custom listener', () => {
    const customHandler = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandler);

    customListener.trigger(new CustomEvent('one'));

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  test('should verify the event trigger with a detail parameter passed on custom listener', () => {
    const customHandler = jest.fn();

    const customListener = listen();

    customListener.add('one', customHandler);

    customListener.trigger('one', {
      customOption: 'some value',
    });

    expect(customHandler).toHaveBeenCalledTimes(1);
    expect(customHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          customOption: 'some value',
        },
      }),
    );
  });
});
