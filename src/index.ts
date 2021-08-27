import {Subject} from 'rxjs';

function createProxy<T extends object>(obj: T): T & {$: Subject<any>} {
  const $ = new Subject();
  return new Proxy<T & {$: Subject<any>}>(
    {...obj, $},
    {
      get: (target: T, propertyKey: PropertyKey, receiver?: any) => {
        console.log('get', propertyKey);
        return Reflect.get(target, propertyKey, receiver);
      },
      set: (
        target: T,
        propertyKey: PropertyKey,
        value: any,
        receiver?: any
      ): boolean => {
        console.log('set', propertyKey);
        Reflect.set(target, propertyKey, value, receiver);
        return true;
      },
    }
  );
}

const proxy = createProxy({a: 'hello'});
console.log(proxy.a);
proxy.a = 'world';
console.log(proxy.a);
console.log(proxy);
