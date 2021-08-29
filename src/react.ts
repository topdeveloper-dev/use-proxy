// eslint-disable-next-line node/no-unpublished-import
import React from 'react';
import {EventEmitter} from 'events';

import {useProxy, runAndMonitor} from '.';
import {AccessEvent} from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  emitter?: EventEmitter;
  listener?: (event: AccessEvent) => void;

  dispose() {
    if (this.emitter && this.listener) {
      this.emitter.off('event', this.listener);
    }
    delete this.emitter;
    delete this.listener;
  }

  constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      [, this.emitter] = useProxy(props);
      const [result, filter] = runAndMonitor(this.emitter, render);
      this.listener = (event: AccessEvent) => {
        if (filter(event)) {
          this.dispose();
          this.forceUpdate();
        }
      };
      this.emitter.on('event', this.listener);
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

    // rewrite shouldComponentUpdate
    if (!this.shouldComponentUpdate) {
      this.shouldComponentUpdate = () => false;
    }
  }
}
