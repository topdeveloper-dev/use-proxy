import {useProxy} from '../src';
import {ProxyEvent} from '../src/models';

describe('getter', () => {
  test('getter', () => {
    const [proxy, emitter] = useProxy({
      visibility: false,
      get visibleTodos() {
        return !this.visibility;
      },
    });
    const events: ProxyEvent[] = [];
    emitter.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    if (proxy.visibleTodos) {
      expect(events).toEqual([
        {name: 'get', paths: ['visibility']},
        {name: 'get', paths: ['visibleTodos']},
      ]);
    }
  });

  test('normal method', () => {
    const [proxy, emitter] = useProxy({
      visibility: false,
      visibleTodos() {
        return !this.visibility;
      },
    });
    const events: ProxyEvent[] = [];
    emitter.on('event', (event: ProxyEvent) => {
      events.push(event);
    });
    if (proxy.visibleTodos()) {
      expect(events).toEqual([{name: 'get', paths: ['visibility']}]);
    }
  });

  test('JS Proxy normal method', () => {
    class Store {
      hidden = false;
      visible() {
        return !this.hidden;
      }
    }
    const accessList: PropertyKey[] = [];
    const proxy = new Proxy<Store>(new Store(), {
      get: (target: any, propertyKey: PropertyKey, receiver: any) => {
        accessList.push(propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
    });
    expect(proxy.visible()).toBe(true);
    expect(accessList).toEqual(['visible', 'hidden']);
  });

  test('JS Proxy getter method', () => {
    class Store {
      hidden = false;
      get visible() {
        return !this.hidden;
      }
    }
    const accessList: PropertyKey[] = [];
    const proxy = new Proxy<Store>(new Store(), {
      get: (target: any, propertyKey: PropertyKey, receiver: any) => {
        accessList.push(propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
    });
    expect(proxy.visible).toBe(true);
    expect(accessList).toEqual(['visible', 'hidden']);
  });
});
