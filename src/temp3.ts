import {EventEmitter} from 'events';

import {emitterKey} from './constants';
import {getEmitter} from './utils';

export function useProxy<T extends object>(target: T): T {
  const setObjectValue = (propertyKey: PropertyKey, value: any) => {
    const subProxy = Reflect.get(value, emitterKey) ? value : useProxy(value);
    const subEventEmitter = Reflect.get(subProxy, emitterKey) as EventEmitter;
    const callback = (eventName: string, paths: PropertyKey[]) => {
      eventEmitter.emit('event', eventName, [propertyKey, ...paths]);
    };
    subEventEmitter.removeAllListeners();
    subEventEmitter.on('event', callback);
    Reflect.set(target, propertyKey, subProxy);
  };
  const handleOldValue = (oldValue: any) => {
    const emitter = getEmitter(oldValue);
    if (emitter) {
      emitter.removeAllListeners();
    }
  };
  const eventEmitter = new EventEmitter();
  const proxy = new Proxy(target, {
    get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
      if (propertyKey === emitterKey) {
        return eventEmitter;
      }
      eventEmitter.emit('event', 'get', [propertyKey]);
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (
      target: T,
      propertyKey: PropertyKey,
      value: any,
      receiver?: any
    ): boolean => {
      handleOldValue(Reflect.get(target, propertyKey));
      if (typeof value === 'object' && value !== null) {
        setObjectValue(propertyKey, value);
      } else {
        Reflect.set(target, propertyKey, value, receiver);
      }
      eventEmitter.emit('event', 'set', [propertyKey]);
      return true;
    },
  });
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    handleOldValue(value);
    if (typeof value === 'object' && value !== null) {
      setObjectValue(propertyKey, value);
    }
  }
  return proxy;
}
