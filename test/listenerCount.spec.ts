import {useProxy} from '../src';

describe('Listener count', () => {
  test('default', () => {
    const proxy = useProxy({
      a: {
        b: {
          c: 'hello',
        },
      },
    });

    expect(proxy.__emitter__.listenerCount('event')).toBe(0);
    expect((proxy.a as any).__emitter__.listenerCount('event')).toBe(1);
    expect((proxy.a.b as any).__emitter__.listenerCount('event')).toBe(1);
    expect((proxy.a.b.c as any).__emitter__).toBe(undefined);
    const temp = proxy.a.b;
    proxy.a.b = temp;
    proxy.a.b = temp;
    proxy.a.b = temp;
    expect(proxy.__emitter__.listenerCount('event')).toBe(0);
    expect((proxy.a as any).__emitter__.listenerCount('event')).toBe(1);
    expect((proxy.a.b as any).__emitter__.listenerCount('event')).toBe(1);
    expect((proxy.a.b.c as any).__emitter__).toBe(undefined);
  });
});
