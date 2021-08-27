import {createProxy, Event} from '../src';

describe('array', () => {
  test('foreach', () => {
    const [proxy, $] = createProxy({a: 'hello', b: {c: 'world'}});
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
});
