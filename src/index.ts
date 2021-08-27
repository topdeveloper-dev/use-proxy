import {Subject} from 'rxjs';

export type Event = {
  type: string;
  path: PropertyKey[];
};

export function createProxy<T extends object>(target: T): [T, Subject<Event>] {
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
      $.next({type: 'set', path: [propertyKey]});
      Reflect.set(target, propertyKey, value, receiver);
      return true;
    },
  });
  for (const propertyKey of Object.keys(target)) {
    const value = Reflect.get(target, propertyKey);
    if (typeof value === 'object' && value !== null) {
      const [subProxy, sub$] = createProxy(value);
      Reflect.set(target, propertyKey, subProxy);
      sub$.subscribe(event =>
        $.next({
          ...event,
          path: [propertyKey, ...event.path],
        })
      );
    }
  }
  return [proxy, $];
}
