import TestRenderer from 'react-test-renderer';
import React from 'react';

import {Component} from '../src/react';
import {useProxy} from '../src/temp3';

class Store {
  number = 0;
  decrease() {
    this.number -= 1;
  }
  increase() {
    this.number += 1;
  }
}

const store = useProxy(new Store());

type AppProps = {
  store: Store;
};

class App extends Component<AppProps> {
  render() {
    const store = this.props.store;
    return (
      <div>
        <button onClick={() => store.decrease()}>-</button>
        <span>{store.number}</span>
        <button onClick={() => store.increase()}>+</button>
      </div>
    );
  }
}

describe('React', () => {
  test('default', async () => {
    const renderer = TestRenderer.create(<App store={store} />);
    const minusButton = renderer.root.find(
      el => el.type === 'button' && el.children && el.children[0] === '-'
    );
    minusButton.props.onClick();
    const span = renderer.root.find(el => el.type === 'span');
    expect(store.number).toEqual(parseInt(span.children[0] as string));
    // console.log(JSON.stringify(renderer.toJSON(), null, 2));
  });
});
