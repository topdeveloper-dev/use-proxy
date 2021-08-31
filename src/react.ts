// eslint-disable-next-line node/no-unpublished-import
import React from 'react';

import {useProxy, run, releaseChildren, ProxyType} from '.';
import {ProxyEvent} from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  propsProxy?: ProxyType<P>;
  shouldRunAgain!: (event: ProxyEvent) => boolean;
  listener = (event: ProxyEvent) => {
    if (this.shouldRunAgain(event)) {
      this.dispose();
      this.forceUpdate();
    }
  };

  dispose() {
    if (this.propsProxy) {
      releaseChildren(this.propsProxy);
      this.propsProxy.__emitter__.off('event', this.listener);
    }
    this.propsProxy = undefined;
  }

  constructor(props: Readonly<P>) {
    super(props);

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.propsProxy = useProxy(props);
      const [result, shouldRunAgain] = run(this.propsProxy, render);
      this.shouldRunAgain = shouldRunAgain;
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
