import {debounce} from 'lodash';
import waitFor from 'wait-for-async';

import {useProxy, autoRun} from '../src';

describe('autoRun', () => {
  test('default', () => {
    class Store {
      greeting = 'Hello';
    }
    const store = useProxy(new Store());
    const greetings: string[] = [];
    const autoRunner = autoRun(store, () => {
      // this method auto runs when `store.greeting` changes
      greetings.push(store.greeting);
    });
    autoRunner.start();
    store.greeting = 'Hi';
    autoRunner.stop();
    expect(greetings).toEqual(['Hello', 'Hi']);
  });

  test('debounce', async () => {
    class Store {
      number = 0;
    }
    const store = useProxy(new Store());
    const numbers: number[] = [];
    const autoRunner = autoRun(
      store,
      () => numbers.push(store.number),
      (func: () => void) => debounce(func, 10, {leading: true, trailing: true})
    );
    autoRunner.start();
    store.number = 1;
    store.number = 2;
    store.number = 3;
    store.number = 4;
    expect(numbers).toEqual([0]);
    await waitFor({interval: 20});
    expect(numbers).toEqual([0, 4]);
  });
});
