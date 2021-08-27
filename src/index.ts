class Obj {
  prop = 8;
}

const obj = new Obj();
const proxyHandler: ProxyHandler<Obj> = {
  get: (target: Obj, p: string | symbol, receiver: typeof Proxy) => {
    return Reflect.get(target, p, receiver);
  },
};
const proxy = new Proxy<Obj>(obj, proxyHandler);
console.log(proxy.prop);
proxy.prop = 9;
console.log(proxy.prop);
