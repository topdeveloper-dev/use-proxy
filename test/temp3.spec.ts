import {useProxy} from '../src/temp3';
import {getEmitter} from '../src/utils';

describe('index', () => {
  test('default', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    const emitter = getEmitter(proxy)!;
    emitter.on('event', (...args) => {
      console.log(...args);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
  });

  test('subscribe to sub prop', () => {
    const proxy = useProxy({a: 'hello', b: {c: 'world'}});
    const emitter = getEmitter(proxy.b)!;
    emitter.on('event', (...args) => {
      console.log(...args);
    });
    proxy.a = 'world';
    proxy.b.c = 'yes!';
  });

  test('new obj as prop', () => {
    type A = {
      b?: {c: string};
    };
    const proxy = useProxy<A>({});
    const emitter = getEmitter(proxy)!;
    emitter.on('event', (...args) => {
      console.log(...args);
    });
    proxy.b = {c: 'hello'};
    proxy.b.c = 'world';
  });
});
