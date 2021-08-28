import TestRenderer from 'react-test-renderer';
import React from 'react';

import {Component} from '../src/react';
import {useProxy} from '../src';

class Store {
  number = 0;
  decrease() {
    this.number -= 1;
  }
  increase() {
    this.number += 1;
  }
}

const [store] = useProxy(new Store());

type AppProps = {
  store: Store;
};

const renderHistory: number[] = [];

class App extends Component<AppProps> {
  render() {
    const store = this.props.store;
    renderHistory.push(store.number);
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
    minusButton.props.onClick();
    minusButton.props.onClick();
    const span = renderer.root.find(el => el.type === 'span');
    expect(store.number).toEqual(parseInt(span.children[0] as string));
    expect(store.number).toBe(-3);
    expect(renderHistory).toEqual([0, -1, -2, -3]);
  });
});
