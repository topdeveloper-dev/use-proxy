// eslint-disable-next-line node/no-unpublished-import
import React from 'react';
import {EventEmitter} from 'events';

import {useProxy, runAgain, releaseChildren, ProxyType} from '.';
import {ProxyEvent} from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  propsProxy?: ProxyType<P>;
  emitter?: EventEmitter;
  listener?: (event: ProxyEvent) => void;

  dispose() {
    if (this.emitter && this.listener && this.propsProxy) {
      this.emitter.off('event', this.listener);
      releaseChildren(this.propsProxy);
    }
    delete this.emitter;
    delete this.listener;
    delete this.propsProxy;
  }

  constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.propsProxy = useProxy(props);
      this.emitter = this.propsProxy.__emitter__;
      const [result, shouldRunAgain] = runAgain(
        this.propsProxy.__emitter__,
        render
      );
      this.listener = (event: ProxyEvent) => {
        if (shouldRunAgain(event)) {
          this.dispose();
          this.forceUpdate();
        }
      };
      this.propsProxy.__emitter__.on('event', this.listener);
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
