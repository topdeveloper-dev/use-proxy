import EventEmitter from 'events';

describe('EventEmitter Limit', () => {
  test('default', () => {
    const eventEmitter = new EventEmitter();
    for (let i = 0; i < 10; i++) {
      eventEmitter.on('event', () => {});
    }
    expect(eventEmitter.listenerCount('event')).toBe(10);
    expect(eventEmitter.listenerCount('')).toBe(0);
  });
});
