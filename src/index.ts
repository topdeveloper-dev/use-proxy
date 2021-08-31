import {EventEmitter} from 'events';

import {ProxyEvent, Children} from './models';

const childrenKey = '&*()_+=-~`!@#$%^';

export type ProxyType<T> = T & {__emitter__: EventEmitter};

export const canProxy = (obj: object) =>
  typeof obj === 'object' && obj !== null;

// release all children
export const releaseChildren = (obj: object): void => {
  if (canProxy(obj)) {
    (Reflect.get(obj, childrenKey) as Children)?.releasesAll();
  }
};

export function useProxy<T extends object>(target: T): ProxyType<T> {
  // return if the object is already a proxy
  if ((target as ProxyType<T>).__emitter__) {
    return target as ProxyType<T>;
  }

  // two variables belongs to the scope of useProxy (the proxy)
  const emitter = new EventEmitter();
  const children = new Children();

  // make child a proxy and add it to children
  const proxyChild = (path: string, value: any) => {
    if (!canProxy(value)) {
      return value;
    }
    const childProxy = useProxy(value);
    children.addChild(path, childProxy.__emitter__, emitter);
    return childProxy;
  };

  const proxy = new Proxy(target, {
    get: (target: T, path: string, receiver?: T) => {
      if (path === '__emitter__') {
        return emitter;
      }
      if (path === childrenKey) {
        return children;
      }
      const value = Reflect.get(target, path, receiver);
      if (typeof value !== 'function' && typeof path !== 'symbol') {
        emitter.emit('event', new ProxyEvent('get', [path]));
      }
      return value;
    },
    set: (target: T, path: string, value: any, receiver?: T): boolean => {
      // no assign object to itself, doesn't make sense
      // array.length assign oldValue === value, strange
      if (canProxy(value) && value === Reflect.get(target, path)) {
        return true;
      }
      // remove old child in case there is one
      children.releaseChild(path);
      Reflect.set(target, path, proxyChild(path, value), receiver);
      if (typeof path !== 'symbol') {
        emitter.emit('event', new ProxyEvent('set', [path]));
      }
      return true;
    },
  });

  // first time init
  for (const path of Object.keys(target)) {
    const value = Reflect.get(target, path);
    Reflect.set(target, path, proxyChild(path, value), target);
  }

  return proxy as ProxyType<T>;
}

export function run<T>(
  proxy: ProxyType<T>,
  f: Function
): [result: any, shouldRunAgain: (event: ProxyEvent) => boolean] {
  const events: ProxyEvent[] = [];
  const listener = (event: ProxyEvent) => events.push(event);
  proxy.__emitter__.on('event', listener);
  const result = f();
  proxy.__emitter__.off('event', listener);
  const getPaths = [
    ...new Set(
      events
        .filter(event => event.name === 'get')
        .map(event => event.pathString())
    ),
  ];
  const shouldRunAgain = (event: ProxyEvent): boolean => {
    if (event.name === 'set') {
      const setPath = event.pathString();
      if (getPaths.some(getPath => getPath.startsWith(setPath))) {
        // if setPath is shorter than getPath, then it's time to refresh
        return true;
      }
    }
    return false;
  };
  return [result, shouldRunAgain];
}

export function autoRun<T>(
  proxy: ProxyType<T>,
  f: () => void,
  decorator?: (f: () => void) => () => void
): {start: () => void; stop: () => void} {
  let shouldRunAgain: (event: ProxyEvent) => boolean;
  const listener = (event: ProxyEvent) => {
    if (shouldRunAgain(event)) {
      runOnce();
    }
  };
  let runOnce = () => {
    [, shouldRunAgain] = run(proxy, f);
  };
  if (decorator) {
    runOnce = decorator(runOnce);
  }
  return {
    start: () => {
      runOnce();
      proxy.__emitter__.on('event', listener);
    },
    stop: () => proxy.__emitter__.off('event', listener),
  };
}
