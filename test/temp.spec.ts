import {useProxy, subscribe} from '../src/temp';

describe('index', () => {
  test('default', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    subscribe(proxy, [], (name: string, paths: string[]) => {
      console.log(name, paths);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
    // expect(events).toEqual([
    //   {type: 'set', path: ['a']},
    //   {type: 'get', path: ['b']},
    //   {type: 'set', path: ['b', 'c']},
    // ]);
  });
});
