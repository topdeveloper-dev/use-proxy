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
    autoRun(store, () => {
      // this method auto runs when `store.greeting` changes
      greetings.push(store.greeting);
    });
    store.greeting = 'Hi';
    expect(greetings).toEqual(['Hello', 'Hi']);
  });

  test('debounce', async () => {
    class Store {
      number = 0;
    }
    const store = useProxy(new Store());
    const numbers: number[] = [];
    autoRun(
      store,
      debounce(
        () => {
          numbers.push(store.number);
        },
        10,
        {leading: true}
      )
    );
    store.number = 1;
    store.number = 2;
    expect(numbers).toEqual([0]);
    await waitFor({interval: 20});
    expect(numbers).toEqual([0, 2]);
  });
});
