import {EventEmitter} from 'events';

const emitterKey: PropertyKey = '__eventEmitter__';

export class AccessEvent {
  name: 'get' | 'set';
  paths: PropertyKey[];
  constructor(name: 'get' | 'set', paths: PropertyKey[]) {
    this.name = name;
    this.paths = paths;
  }
  pathString() {
    return this.paths.join('+');
  }
}

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
  const eventEmitter = new EventEmitter();

  const connectChild = (
    propertyKey: PropertyKey,
    value: any,
    receiver?: any
  ) => {
    const subProxy = getEmitter(value) ? value : useProxy(value)[0];
    const subEventEmitter = getEmitter(subProxy)!;
    subEventEmitter.on('event', (event: AccessEvent) => {
      eventEmitter.emit(
        'event',
        new AccessEvent(event.name, [propertyKey, ...event.paths])
      );
    });
    Reflect.set(target, propertyKey, subProxy, receiver);
  };

  const proxy = new Proxy(target, {
    get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
      if (propertyKey === emitterKey) {
        return eventEmitter;
      }
      const value = Reflect.get(target, propertyKey, receiver);
      if (typeof value !== 'function') {
        eventEmitter.emit('event', new AccessEvent('get', [propertyKey]));
      }
      return value;
    },
    set: (
      target: T,
      propertyKey: PropertyKey,
      value: any,
      receiver?: any
    ): boolean => {
      const oldValue = Reflect.get(target, propertyKey);
      if (value === oldValue) {
        return true;
      }
      // disconnect old value parent
      getEmitter(oldValue)?.removeAllListeners();
      if (canProxy(value)) {
        connectChild(propertyKey, value, receiver);
      } else {
        Reflect.set(target, propertyKey, value, receiver);
      }
      eventEmitter.emit('event', new AccessEvent('set', [propertyKey]));
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

  return [proxy, eventEmitter];
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
