# useProxy

The name `useProxy` was inspired by React [useState](https://reactjs.org/docs/hooks-intro.html).

Just like `useState`, it is mainly designed to work with React applications. 

Unlike `useState`, which only works with React functions; `useProxy` mainly works with React classes.

`useProxy` is the successor of [SubX](https://github.com/tylerlong/subx), which is similar to MobX.


## What's the value of `useProxy`?

It allows you to maintain your app state in OOP style.  
I am not saying that OOP style is the best practice for React development.  
But if do want to code your React app in OOP style, you should give this library a try.

It supports TypeScript very well. 


## Demo application

[TodoMVC powered by UseProxy](https://chuntaoliu.com/use-proxy-demo-todomvc/)

[Source Code](https://github.com/tylerlong/use-proxy-demo-todomvc)


## Installation

```
yarn add @tylerlong/use-proxy
```


## Usage

```ts
import {useProxy} from '@tylerlong/use-proxy';
import {Component} from '@tylerlong/use-proxy/build/react';

class Store {
  count = 0;
  increase() {
    this.count += 1;
  }
}
const store = useProxy(new Store());

class App extends Component<{store: Store}> {
  render() {
    const store = this.props.store;
    return (
      <div>
        <span>{store.count}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}
```

## Event Emitter

```ts
import {useProxy} from '@tylerlong/use-proxy';
import {ProxyEvent} from '@tylerlong/use-proxy/build/models';

class Store {}
const store = useProxy(new Store());
```

`store.__emitter__` is an `EventEmitter` which will emit events about read/write to store. You can subscribe to events:

```ts
store.__emitter__.on('event', (event: ProxyEvent) => {
  // do something with event
});
```


## Utility methods

### `run`

The signature of `run` is

```ts
function run<T>(
  proxy: ProxyType<T>,
  func: Function
): [result: any, isTrigger: (event: ProxyEvent) => boolean]
```

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `func` is a function which reads `proxy`.
- `result` is the result of `func()`.
- `isTrigger` is a function which returns `true` if an `event` will "trigger" `func()` to have a different result.
  - when it returns true, most likely it's time to run `func()` again(because you will get a different result from last time).

When you invoke `run(proxy, func)`, `func()` is invoked immediately. 
You can subscribe to `proxy.__emitter__` and filter the events using `isTrigger` to get the trigger events (to run `func()` again).

For a sample usage of `run`, please check [./src/react.ts](./src/react.ts).

Another example is the implementation of the `autoRun` utility method. You may find it in [./src/index.ts](./src/index.ts).


### `autoRun`

The signature of `autoRun` is

```ts
function autoRun<T>(
  proxy: ProxyType<T>,
  func: () => void,
  decorator?: (func: () => void) => () => void
): {start: () => void; stop: () => void}
```

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `func` is a function which reads `proxy`.
- `decorator` is a method to change run schedule of `func`, for example: `func => _.debounce(func, 10, {leading: true, trailing: true})`
- `start` and `stop` is to start and stop `autoRun`.

When you invoke `start()`, `func()` is invoked immediately.
`func()` will be invoked automatically afterwards if there are trigger events from `proxy` which change the result of `func()`.
Invoke `stop` to stop `autoRun`.

For sample usages of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).


## Known issue

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- You cannot proxy some built-in objects, such as `Set` & `Map`.
- `run` and `autoRun` only support sync methods. for async methods, make sure that the async part is irrelevant because it won't be monitored.


## Todo

- cache data for getter functions to make it faster, just like what I did in SubX project
- When is `typeof path === 'symbol'`?
- Support React Hooks https://reactjs.org/docs/hooks-intro.html
  - I think I mean function style react components
- Native objects 会报错，比如说 `window.speechSynthesis.getVoices()`
- `autoRun` 逻辑上有漏洞。比如说我想保存一个对象。一开始这个对象的property不全。后来全了。但是新增的props并不被monitor。
  - 一个workaround是把property的值设为null。
    - 不设为undefined，因为json不支持，持久化会有问题。 不过这个问题和本项目无关
- 如果有循环引用的结构，会报错 `Uncaught RangeError: Maximum call stack size exceeded`
- autoRun 的函数中如果修改了数据，就会引发死循环？ 也就是autoRun不能修改proxy的数据？


## Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
  - you also don't have to `on` and `off` again and again. Sometimes you just `on` and let it on until user explicit it request it to be off.
    - check the source code of `autoRun`.
- rewrite some emitter.on to promise.
  - the idea is great, but it will turn the library from sync to async, which will cause unexpected consequences.
  - `React.render`, `EventEmitter.on`, `rxjs.observable.next` are all sync, there must be a good reason to stay with sync. 
