import {createProxy} from '../src';

describe('array', () => {
  test('foreach', () => {
    const [proxy, $] = createProxy({a: 'hello', b: {c: 'world'}});
    $.subscribe(event => console.log(event));
    proxy.a = 'world';
    proxy.b.c = 'yes!';
  });
});
