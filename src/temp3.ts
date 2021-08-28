import {EventEmitter} from 'events';

import {emitterKey} from './constants';
import {Event} from './types';
import {getEmitter, canProxy} from './utils';

const disconnectParent = (oldValue: any) => {
  const emitter = getEmitter(oldValue);
  if (emitter) {
    emitter.removeAllListeners();
  }
};

export function useProxy<T extends object>(target: T): T {
  const eventEmitter = new EventEmitter();

  const connectChild = (propertyKey: PropertyKey, value: any) => {
    const subProxy = getEmitter(value) ? value : useProxy(value);
    const subEventEmitter = getEmitter(subProxy)!;
    subEventEmitter.on('event', (event: Event) => {
      eventEmitter.emit(
        'event',
        new Event(event.name, [propertyKey, ...event.paths])
      );
    });
    Reflect.set(target, propertyKey, subProxy);
  };

  const proxy = new Proxy(target, {
    get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
      if (propertyKey === emitterKey) {
        return eventEmitter;
      }
      eventEmitter.emit('event', new Event('get', [propertyKey]));
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (
      target: T,
      propertyKey: PropertyKey,
      value: any,
      receiver?: any
    ): boolean => {
      disconnectParent(Reflect.get(target, propertyKey));
      if (canProxy(value)) {
        connectChild(propertyKey, value);
      } else {
        Reflect.set(target, propertyKey, value, receiver);
      }
      eventEmitter.emit('event', new Event('set', [propertyKey]));
      return true;
    },
  });

  // first time init
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    if (canProxy(value)) {
      connectChild(propertyKey, value);
    }
  }

  return proxy;
}
