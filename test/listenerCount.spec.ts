import {getEmitter, useProxy} from '../src';

describe('Listener count', () => {
  test('default', () => {
    const [proxy] = useProxy({
      a: {
        b: {
          c: 'hello',
        },
      },
    });
    console.log(getEmitter(proxy.a.b)?.listenerCount('event'));
  });
});
