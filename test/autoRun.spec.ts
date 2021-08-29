import {useProxy, autoRun} from '../src';

describe('autoRun', () => {
  test('default', () => {
    class Store {
      greeting = 'Hello';
    }
    const [store, emitter] = useProxy(new Store());
    const greetings: string[] = [];
    autoRun(emitter, () => {
      // this method auto runs when `store.greeting` changes
      greetings.push(store.greeting);
    });
    store.greeting = 'Hi';
    expect(greetings).toEqual(['Hello', 'Hi']);
  });
});
