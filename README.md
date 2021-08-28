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
