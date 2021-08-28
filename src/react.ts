// eslint-disable-next-line node/no-unpublished-import
import React from 'react';
import {EventEmitter} from 'events';

import {useProxy, runAndMonitor} from '.';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  emitter?: EventEmitter;
  newEmitter?: EventEmitter;
  dispose() {
    this.emitter?.removeAllListeners();
    this.emitter?.removeAllListeners();
    delete this.emitter;
    delete this.newEmitter;
  }

  constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      [, this.emitter] = useProxy(props);
      const [result, newEmitter] = runAndMonitor(this.emitter, render);
      newEmitter.once('event', () => {
        this.dispose();
        this.forceUpdate();
      });
      return result;
    };

    // rewrite componentWillUnmount()
    if (this.componentWillUnmount) {
      const originalComponentWillUnmount = this.componentWillUnmount.bind(this);
      this.componentWillUnmount = () => {
        this.dispose();
        originalComponentWillUnmount();
      };
    } else {
      this.componentWillUnmount = () => this.dispose();
    }
  }
}
