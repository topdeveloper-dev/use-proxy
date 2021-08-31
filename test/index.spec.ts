import {useProxy} from '../src';
import {ProxyEvent} from '../src/models';

describe('index', () => {
  test('default', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    const events: ProxyEvent[] = [];
    proxy.__emitter__.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    expect(events).toEqual([
      {name: 'set', paths: ['a']},
      {name: 'get', paths: ['b']},
      {name: 'set', paths: ['b', 'c']},
    ]);
  });

  test('subscribe to sub prop', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    const emitter = (proxy.b as any).__emitter__;
    const events: ProxyEvent[] = [];
    emitter.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    expect(events).toEqual([{name: 'set', paths: ['c']}]);
  });

  test('new obj as prop', () => {
    type A = {
      b?: {c: string};
    };
    const proxy = useProxy<A>({});
    const events: ProxyEvent[] = [];
    proxy.__emitter__.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    proxy.b = {c: 'hello'};
    proxy.b.c = 'world';
    expect(events).toEqual([
      {name: 'set', paths: ['b']},
      {name: 'get', paths: ['b']},
      {name: 'set', paths: ['b', 'c']},
    ]);
  });

  test('set same obj multiple times', () => {
    type A = {
      b?: {c: string};
    };
    const proxy = useProxy<A>({});
    const events: ProxyEvent[] = [];
    proxy.__emitter__.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    proxy.b = {c: 'hello'};
    const temp = proxy.b;
    proxy.b = temp;
    proxy.b = temp;
    proxy.b.c = 'world';
    expect(events).toEqual([
      {name: 'set', paths: ['b']},
      {name: 'get', paths: ['b']},
      {name: 'get', paths: ['b']},
      {name: 'set', paths: ['b', 'c']},
    ]);
  });

  test('to JSON', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    expect(JSON.stringify(proxy)).toBe('{"a":"hello","b":{"c":"world"}}');
  });
});
