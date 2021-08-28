# useProxy

The name `useProxy` was inspired by React [useState](https://reactjs.org/docs/hooks-state.html).

Just like `useState`, it is mainly designed to work with React applications. 

Unlike `useState`, which only works with React functions; `useProxy` mainly works with React classes.

`useProxy` is the successor of [SubX](https://github.com/tylerlong/subx), which is similar to MobX.


## What's the value of `useProxy`?

It allows you to maintain your app state in OOP style. 

I am not saying that OOP style is the best practice for React development. 
But React Hooks' functional style is hardly my cup of tea.


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

type AppProps = {
  store: Store;
};
class App extends Component<AppProps> {
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

## Utility methods

### `runAndMonitor`

The signature of `runAndMonitor` is

```ts
(emitter: EventEmitter, f: Function): [result: any, newEmitter: EventEmitter]
```

- `emitter` is generated from `useProxy` method: `const[, emitter] = useProxy(state)`
- `f` is the function to execute
- `result` is the result of `f()`
- `newEmitter` is a new EventEmitter which emits events whenever data changes in proxy which will affect the result of `f()`
  - when you get an event from `newEmitter`, most likely it means it's time to run `f()` again

For a sample usage of `runAndMonitor`, please check `./src/react.ts`.


## For maintainers

### How to publish

```
npm publish --access=public
```

And by experiment I find that `--access=public` is only needed when the first time you release this library to https://www.npmjs.com/.

Subsequent releases can omit `--access=public` and the release is still public.


## Known issue

- It doesn't with getters. Check [./test/getter.spec.ts](./test/getter.spec.ts).
  - https://stackoverflow.com/questions/68967002/weird-issue-about-javascript-proxy-and-getter-functions
  - Bonus: cache getter result to improve performance
- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- The react integration rewrites `shouldComponentUpdate` to always return `false`. It won't be an issue if you totally rely on `useProxy` to update the component.
- “MaxListenersExceededWarning: Possible EventEmitter memory leak detected”
  - You may see this warning message. Because this project uses lots of eventListeners to track data change.
  - I don't think there is memory leak. It is by design. But it's till annoying to see this warning.


## Todo

- Add logging, easily turn on and off
