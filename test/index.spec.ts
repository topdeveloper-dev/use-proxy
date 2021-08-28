import {useProxy, Event} from '../src';

describe('index', () => {
  test('default', () => {
    const [proxy, $] = useProxy({a: 'hello', b: {c: 'world'}});
    const events: Event[] = [];
    $.subscribe(event => events.push(event));
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    expect(events).toEqual([
      {type: 'set', path: ['a']},
      {type: 'get', path: ['b']},
      {type: 'set', path: ['b', 'c']},
    ]);
  });

  test('new obj as prop', () => {
    type A = {
      b?: {c: string};
    };
    const [proxy, $] = useProxy<A>({});
    const events: Event[] = [];
    $.subscribe(event => events.push(event));
    proxy.b = {c: 'hello'};
    proxy.b.c = 'world';
    expect(events).toEqual([
      {type: 'set', path: ['b']},
      {type: 'get', path: ['b']},
      {type: 'set', path: ['b', 'c']},
    ]);
  });

  test('set same obj multiple times', () => {
    type A = {
      b?: {c: string};
    };
    const [proxy, $] = useProxy<A>({});
    console.log(typeof proxy);
    const events: Event[] = [];
    $.subscribe(event => events.push(event));
    proxy.b = {c: 'hello'};
    const temp = proxy.b;
    proxy.b = temp;
    proxy.b = temp;
    proxy.b.c = 'world';
    console.log(events);
    // expect(events).toEqual([
    //   {type: 'set', path: ['b']},
    //   {type: 'get', path: ['b']},
    //   {type: 'set', path: ['b', 'c']},
    // ]);
  });
});
