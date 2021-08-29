import {EventEmitter} from 'events';
import {AccessEvent, Child} from './models';

const emitterKey = '__emitter__';

export const canProxy = (obj: any) => {
  return typeof obj === 'object' && obj !== null;
};

export const getEmitter = (obj: any): EventEmitter | undefined => {
  if (!canProxy(obj)) {
    return undefined;
  }
  return Reflect.get(obj, emitterKey);
};

export function useProxy<T extends object>(target: T): [T, EventEmitter] {
  // return if the object is already a proxy
  const oldEmitter = getEmitter(target);
  if (oldEmitter) {
    return [target, oldEmitter!];
  }

  const emitter = new EventEmitter();
  const children: {[key: string]: Child} = {};

  const connectChild = (propertyKey: string, value: any, receiver?: any) => {
    const [childProxy, childEmitter] = useProxy(value);
    Reflect.set(target, propertyKey, childProxy, receiver);
    children[propertyKey] = new Child(propertyKey, childEmitter, emitter);
  };

  const proxy = new Proxy(target, {
    get: (target: T, propertyKey: string, receiver?: any) => {
      if (propertyKey === emitterKey) {
        return emitter;
      }
      const value = Reflect.get(target, propertyKey, receiver);
      if (typeof value !== 'function') {
        emitter.emit('event', new AccessEvent('get', [propertyKey]));
      }
      return value;
    },
    set: (
      target: T,
      propertyKey: string,
      value: any,
      receiver?: any
    ): boolean => {
      const oldValue = Reflect.get(target, propertyKey);
      if (value === oldValue) {
        return true;
      }
      // disconnect old value parent
      const child = children[propertyKey];
      if (child) {
        child.dispose();
        delete children[propertyKey];
      }

      if (canProxy(value)) {
        connectChild(propertyKey, value, receiver);
      } else {
        Reflect.set(target, propertyKey, value, receiver);
      }
      emitter.emit('event', new AccessEvent('set', [propertyKey]));
      return true;
    },
  });

  // first time init
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    if (canProxy(value)) {
      connectChild(propertyKey, value, target);
    }
  }

  return [proxy, emitter];
}

export const runAndMonitor = (
  emitter: EventEmitter,
  f: Function
): [result: any, newEmitter: EventEmitter] => {
  const events: AccessEvent[] = [];
  emitter.on('event', (event: AccessEvent) => events.push(event));
  const result = f();
  emitter.removeAllListeners();
  const getPaths = [
    ...new Set(
      events
        .filter(event => event.name === 'get')
        .map(event => event.pathString())
    ),
  ];
  const newEmitter = new EventEmitter();
  emitter.on('event', (event: AccessEvent) => {
    if (event.name === 'set') {
      const setPath = event.pathString();
      if (getPaths.some(getPath => getPath.startsWith(setPath))) {
        // if setPath is shorter than getPath, then it's time to refresh
        newEmitter.emit('event', event);
      }
    }
  });
  return [result, newEmitter];
};
