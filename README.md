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
const [store] = useProxy(new Store());

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
const [store, emitter] = useProxy(new Store());
```

`emitter` is an `EventEmitter` which will emit events about read/write to store. You can subscribe to events:

```ts
emitter.on('event', (event: ProxyEvent) => {
  // do something with event
});
```


## Utility methods

### `runAgain`

The signature of `runAgain` is

```ts
(emitter: EventEmitter, f: Function): [result: any, shouldRunAgain: (event: ProxyEvent) => boolean]
```

- `emitter` is generated from `useProxy` method: `const [proxy, emitter] = useProxy(store)`.
- `f` is a function which reads `proxy`.
- `result` is the result of `f()`.
- `shouldRunAgain` is a function which returns `true` if an `event` from `emitter` will cause `f()` to have a different result.
  - when it returns true, most likely it's time to **run** `f()` **again**.

When you invoke `runAgain`, `f()` is invoked immediately. 
You can subscribe to `emitter` and filter the events using `shouldRunAgain` to get the `event` to run `f()` again.

For a sample usage of `runAgain`, please check [./src/react.ts](./src/react.ts).


### `autoRun`

The signature of `autoRun` is

```ts
(emitter: EventEmitter, f: Function): void
```

- `emitter` is generated from `useProxy` method: `const [proxy, emitter] = useProxy(store)`.
- `f` is a function which reads `proxy`.

When you invoke `autoRun(emitter, f)`, `f()` is invoked immediately.
`f()` will be invoked automatically afterwards if there are events from `emitter` which change the result of `f()`.

You may [debounce](https://lodash.com/docs/4.17.15#debounce) `f()`.

For a sample usage of `autoRun`, please check [./test/autoRun.spec.ts](./test/autoRun.spec.ts).


## Known issue

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- You cannot proxy some built-in objects, such as `Set` & `Map`.


## Todo

- Add logging, easily turn on and off
- cache data for getter functions, just like what I did in SubX project


## Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
