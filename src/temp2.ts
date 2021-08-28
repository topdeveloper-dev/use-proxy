import {EventEmitter} from 'events';

const emitterKey: PropertyKey = 'eventEmitter';

export const subscribe = (
  proxy: any,
  callback: (eventName: string, paths: string[]) => void,
  paths: string[] = []
) => {
  for (const propertyKey of Object.keys(proxy)) {
    const value = Reflect.get(proxy, propertyKey);
    if (typeof value === 'object' && value !== null) {
      subscribe(value, callback, [...paths, propertyKey]);
    }
  }
  const eventEmitter = Reflect.get(proxy, emitterKey);
  if (eventEmitter) {
    eventEmitter.on('event', (name: string, path: string) => {
      callback(name, [...paths, path]);
    });
  }
};

export function useProxy<T extends object>(target: T): T {
  const setObjectValue = (propertyKey: PropertyKey, value: any) => {
    Reflect.set(
      target,
      propertyKey,
      Reflect.get(value, emitterKey) ? value : useProxy(value)
    );
  };
  const eventEmitter = new EventEmitter();
  const proxy = new Proxy(target, {
    get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
      if (propertyKey === emitterKey) {
        return eventEmitter;
      }
      eventEmitter.emit('event', 'get', propertyKey);
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (
      target: T,
      propertyKey: PropertyKey,
      value: any,
      receiver?: any
    ): boolean => {
      if (typeof value === 'object' && value !== null) {
        setObjectValue(propertyKey, value);
      } else {
        Reflect.set(target, propertyKey, value, receiver);
      }
      eventEmitter.emit('event', 'set', propertyKey);
      return true;
    },
  });
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    if (typeof value === 'object' && value !== null) {
      setObjectValue(propertyKey, value);
    }
  }
  return proxy;
}
