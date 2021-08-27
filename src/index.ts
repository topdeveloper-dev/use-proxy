import {Subject} from 'rxjs';

export type Event = {
  type: string;
  path: PropertyKey[];
};

export function useProxy<T extends object>(target: T): [T, Subject<Event>] {
  const setObjectValue = (propertyKey: PropertyKey, value: any) => {
    const [subProxy, sub$] = useProxy(value);
    Reflect.set(target, propertyKey, subProxy);
    sub$.subscribe(event =>
      $.next({
        ...event,
        path: [propertyKey, ...event.path],
      })
    );
  };

  const $ = new Subject<Event>();
  const proxy = new Proxy<T>(target, {
    get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
      $.next({type: 'get', path: [propertyKey]});
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
      $.next({type: 'set', path: [propertyKey]});
      return true;
    },
  });
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    if (typeof value === 'object' && value !== null) {
      setObjectValue(propertyKey, value);
    }
  }
  return [proxy, $];
}
