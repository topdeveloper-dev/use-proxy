import TestRenderer from 'react-test-renderer';
import React from 'react';

import {Component} from '../src/react';

class App extends Component {
  render() {
    return <h1>hello world</h1>;
  }
}

describe('React', () => {
  test('default', async () => {
    const renderer = TestRenderer.create(<App />);
    console.log(renderer.toJSON());
  });
});
