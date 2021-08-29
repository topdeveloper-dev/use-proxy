# useProxy

The name `useProxy` was inspired by React [useState](https://reactjs.org/docs/hooks-intro.html).

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
(emitter: EventEmitter, f: Function): [result: any, filter: (event: AccessEvent) => boolean]
```

- `emitter` is generated from `useProxy` method: `const[, emitter] = useProxy(state)`
- `f` is the function to execute
- `result` is the result of `f()`
- `filter` is a function which returns `true` if an `event` from `emitter` will cause `f()` to have a different result.
  - when it returns true, most likely it's time to run `f()` again

For a sample usage of `runAndMonitor`, please check `./src/react.ts`.


## For maintainers

### How to publish

```
npm publish --access=public
```

And by experiment I find that `--access=public` is only needed when the first time you release this library to https://www.npmjs.com/.

Subsequent releases can omit `--access=public` and the release is still public.


## Known issue

- It only monitors `get` and `set` of properties. It doesn't monitor `delete`, `has` and `keys`. Because in 99.9% cases, `get` & `set` are sufficient to monitor and manage data.
- The react integration rewrites `shouldComponentUpdate` to always return `false`. It won't be an issue if you totally rely on `useProxy` to update the component.


## Todo

- Add logging, easily turn on and off
- cache data for getter functions, just like what I did in SubX project
- Add `autoRun` method so that user could easily save store to disk
- naming: `runAndMonitor`, `filter`


## Notes

- every `emitter.on()` must have a corresponding `emitter.off()`. Otherwise there will be memory leak.
