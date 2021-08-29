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

  const connectChild = (path: string, value: any, receiver?: any) => {
    const [childProxy, childEmitter] = useProxy(value);
    Reflect.set(target, path, childProxy, receiver);
    children[path] = new Child(path, childEmitter, emitter);
  };

  const proxy = new Proxy(target, {
    get: (target: T, path: string, receiver?: any) => {
      if (path === emitterKey) {
        return emitter;
      }
      const value = Reflect.get(target, path, receiver);
      if (typeof value !== 'function') {
        emitter.emit('event', new AccessEvent('get', [path]));
      }
      return value;
    },
    set: (target: T, path: string, value: any, receiver?: any): boolean => {
      const oldValue = Reflect.get(target, path);
      if (value === oldValue) {
        return true;
      }
      // disconnect old value parent
      const child = children[path];
      if (child) {
        child.dispose();
        delete children[path];
      }

      if (canProxy(value)) {
        connectChild(path, value, receiver);
      } else {
        Reflect.set(target, path, value, receiver);
      }
      emitter.emit('event', new AccessEvent('set', [path]));
      return true;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    if (canProxy(value)) {
      connectChild(path, value, target);
    }
  }

  return [proxy, emitter];
}

export const runAndMonitor = (
  emitter: EventEmitter,
  f: Function
): [result: any, newEmitter: EventEmitter] => {
  const events: AccessEvent[] = [];
  const callback = (event: AccessEvent) => events.push(event);
  emitter.on('event', callback);
  const result = f();
  emitter.off('event', callback);
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
