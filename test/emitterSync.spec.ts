import {EventEmitter} from 'events';

describe('emitter sync', () => {
  test('default', async () => {
    const emitter = new EventEmitter();
    const list: number[] = [];
    emitter.on('event', (number: number) => {
      list.push(number);
    });
    emitter.emit('event', 0);
    emitter.emit('event', 1);
    emitter.emit('event', 2);
    list.push(100);
    emitter.emit('event', 3);
    emitter.emit('event', 4);
    emitter.emit('event', 5);
    expect(list).toEqual([0, 1, 2, 100, 3, 4, 5]);
  });
});
