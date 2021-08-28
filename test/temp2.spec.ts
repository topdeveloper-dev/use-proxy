import {useProxy, subscribe} from '../src/temp2';

describe('index', () => {
  // test('default', () => {
  //   const proxy = useProxy({a: 'hello', b: {c: 'world'}});
  //   subscribe(proxy, (name: string, paths: string[]) => {
  //     console.log(name, paths);
  //   });
  //   proxy.a = 'world';
  //   proxy.b.c = 'yes!';
  // });

  // test('subscribe to sub prop', () => {
  //   const proxy = useProxy({a: 'hello', b: {c: 'world'}});
  //   subscribe(proxy.b, (name: string, paths: string[]) => {
  //     console.log(name, paths);
  //   });
  //   proxy.a = 'world';
  //   proxy.b.c = 'yes!';
  // });

  test('new obj as prop', () => {
    type A = {
      b?: {c: string};
    };
    const proxy = useProxy<A>({});
    subscribe(proxy, (name: string, paths: string[]) => {
      console.log(name, paths);
    });
    proxy.b = {c: 'hello'};
    proxy.b.c = 'world';
  });
});
