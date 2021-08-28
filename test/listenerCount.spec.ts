import {getEmitter, useProxy} from '../src';

describe('Listener count', () => {
  test('default', () => {
    const [proxy] = useProxy({
      a: {
        b: {
          c: 'hello',
        },
      },
    });

    expect(getEmitter(proxy)?.listenerCount('event')).toBe(0);
    console.log(getEmitter(proxy.a));
    // expect(getEmitter(proxy.a)?.listenerCount('event')).toBe(1);
    // expect(getEmitter(proxy.a.b)?.listenerCount('event')).toBe(1);
    expect(getEmitter(proxy.a.b.c)?.listenerCount('event')).toBe(undefined);
    const temp = proxy.a.b;
    proxy.a.b = temp;
    proxy.a.b = temp;
    proxy.a.b = temp;
    expect(getEmitter(proxy)?.listenerCount('event')).toBe(0);
    // expect(getEmitter(proxy.a)?.listenerCount('event')).toBe(1);
    // expect(getEmitter(proxy.a.b)?.listenerCount('event')).toBe(1);
    expect(getEmitter(proxy.a.b.c)?.listenerCount('event')).toBe(undefined);
  });
});
