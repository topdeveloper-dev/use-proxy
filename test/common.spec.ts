import EventEmitter = require('events');

describe('index', () => {
  test('event emitter on and off', () => {
    const eventEmitter = new EventEmitter();
    const callback = (message: string) => {
      console.log(message);
    };
    eventEmitter.on('event', callback);
    eventEmitter.removeAllListeners();
    eventEmitter.emit('event', 'Hello');
  });
});
