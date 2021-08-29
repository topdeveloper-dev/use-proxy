import {useProxy} from '../src';
import {AccessEvent} from '../src/models';

describe('array', () => {
  test('proxy set length', () => {
    const a: number[] = [];
    const keys: string[] = [];
    const proxy = new Proxy<number[]>(a, {
      set: (
        target: object,
        propertyKey: string,
        value: any,
        receiver?: any
      ) => {
        keys.push(propertyKey);
        Reflect.set(target, propertyKey, value, receiver);
        return true;
      },
    });
    proxy.push(1);
    expect(keys).toEqual(['0', 'length']);
  });

  test('useProxy set length', () => {
    class Store {
      todos: string[] = [];
    }
    const [proxy, emitter] = useProxy(new Store());
    const events: AccessEvent[] = [];
    emitter.on('event', (event: AccessEvent) => {
      if (event.name === 'set') {
        events.push(event);
      }
    });
    proxy.todos.push('hello');
    expect(events.map(e => e.pathString())).toEqual([
      'todos+0',
      'todos+length',
    ]);
  });
});
