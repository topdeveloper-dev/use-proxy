import {useProxy} from '../src';

describe('plain objects', () => {
  test('default', () => {
    class Store {
      _config = '{}';
      get config() {
        return JSON.parse(store._config || '{}');
      }
    }
    const store = useProxy(new Store());
    store._config = JSON.stringify({
      someString: 'sss',
      someArr: [],
    });
    expect(store.config.__emitter__).toBeUndefined();
  });

  test('another way', () => {
    class Store {
      config = {};
    }
    const store = useProxy(new Store());
    store.config = {
      someString: 'sss',
      someArr: [],
    };
    expect(store.__emitter__).toBeDefined();
    expect((store.config as any).__emitter__).toBeDefined();
    const plainObject = JSON.parse(JSON.stringify(store.config));
    expect(plainObject.__emitter__).toBeUndefined();
  });
});
