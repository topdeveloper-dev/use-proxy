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
});
