import {Subject} from 'rxjs';

type Event = {
  type: string;
  path: PropertyKey;
};

function createProxy<T extends object>(obj: T): [T, Subject<Event>] {
  const $ = new Subject<Event>();
  return [
    new Proxy<T>(obj, {
      get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
        $.next({type: 'get', path: propertyKey});
        return Reflect.get(target, propertyKey, receiver);
      },
      set: (
        target: T,
        propertyKey: PropertyKey,
        value: any,
        receiver?: any
      ): boolean => {
        $.next({type: 'set', path: propertyKey});
        Reflect.set(target, propertyKey, value, receiver);
        return true;
      },
    }),
    $,
  ];
}

const [proxy, $] = createProxy({a: 'hello', b: {c: 'world'}});
$.subscribe(event => console.log(event));

console.log(proxy.a);
proxy.a = 'world';
console.log(proxy.a);
console.log(proxy);
console.log(proxy.b);
console.log(proxy.b.c);
