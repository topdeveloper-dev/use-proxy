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

[TodoMVC powered by UseProxy](chuntaoliu.com/use-proxy-demo-todomvc/)

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
  f: Function
): [result: any, shouldRunAgain: (event: ProxyEvent) => boolean]
```

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `f` is a function which reads `proxy`.
- `result` is the result of `f()`.
- `shouldRunAgain` is a function which returns `true` if an `event` from `proxy` will cause `f()` to have a different result.
  - when it returns true, most likely it's time to run `f()` again.

When you invoke `run(proxy, f)`, `f()` is invoked immediately. 
You can subscribe to `proxy.__emitter__` and filter the events using `shouldRunAgain` to get the `event` to run `f()` again.

For a sample usage of `run`, please check [./src/react.ts](./src/react.ts).


### `autoRun`

The signature of `autoRun` is

```ts
function autoRun<T>(proxy: ProxyType<T>, f: Function): void
```

- `proxy` is generated from `useProxy` method: `const proxy = useProxy(store)`.
- `f` is a function which reads `proxy`.

When you invoke `autoRun(proxy, f)`, `f()` is invoked immediately.
`f()` will be invoked automatically afterwards if there are events from `proxy` which change the result of `f()`.

You may [debounce](https://lodash.com/docs/4.17.15#debounce) `f()`.

For a sample usage of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).


## Known issue

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- You cannot proxy some built-in objects, such as `Set` & `Map`.


## Todo

- Add logging, easily turn on and off
- cache data for getter functions, just like what I did in SubX project
- When is `typeof path === 'symbol'`?
- if `debounce`, autoRun cannot detect read events any more

- rxjs debounce trigger event, my implementation debounce `f()`, that's why mine is buggy. it will cause `run()` to generate incorrect result.
- 有时没必要反复 emitter on and off，一直on就行了，除非提供了接口可以停止事件处理。


## Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
- rewrite some emitter.on to promise
  - the idea is great, but it will turn the library from sync to async, which will cause unexpected consequences.
  - `React.render`, `EventEmitter.on`, `rxjs.observable.next` are all sync, there must be a good reason to stay with sync. 
