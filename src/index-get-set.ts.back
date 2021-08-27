class Obj {
  prop = 8;
  arr = [1, 2, 3];
}

const obj = new Obj();
const proxyHandler: ProxyHandler<Obj> = {
  get: (target: Obj, p: string | symbol, receiver: any) => {
    console.log('get', p);
    return Reflect.get(target, p, receiver);
  },
  set: (
    target: Obj,
    p: string | symbol,
    value: any,
    receiver: any
  ): boolean => {
    console.log('set', p);
    Reflect.set(target, p, value, receiver);
    return true;
  },
};
const proxy = new Proxy<Obj>(obj, proxyHandler);
console.log(proxy.prop);
proxy.prop = 9;
console.log(proxy.prop);
console.log(proxy.arr);
console.log(proxy.arr[1]);
proxy.arr[1] = 5;
console.log(proxy.arr[1]);
