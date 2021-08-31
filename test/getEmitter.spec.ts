import {EventEmitter} from 'events';
import {useProxy} from '../src';

describe('getter', () => {
  test('getter', () => {
    const obj = {a: 1, b: 2};
    const proxy = useProxy(obj);
    expect(proxy.__emitter__).toBeDefined();
    expect(proxy.__emitter__ instanceof EventEmitter);
    expect(JSON.parse(JSON.stringify(proxy, null, 2))).toEqual(obj);
  });
});
