// eslint-disable-next-line node/no-unpublished-import
import React from 'react';

import {useProxy, run, releaseChildren, ProxyType} from '.';
import {ProxyEvent} from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  theProps: Readonly<P>;
  propsProxy?: ProxyType<P>;
  isTrigger!: (event: ProxyEvent) => boolean;
  listener = (event: ProxyEvent) => {
    if (this.isTrigger(event)) {
      this.forceUpdate();
    }
  };

  dispose() {
    if (this.propsProxy) {
      releaseChildren(this.propsProxy);
      this.propsProxy.__emitter__.off('event', this.listener);
      this.propsProxy = undefined;
    }
  }

  constructor(props: Readonly<P>) {
    super(props);
    this.theProps = props;

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      this.propsProxy = useProxy(this.theProps);
      const [result, isTrigger] = run(this.propsProxy, render);
      this.isTrigger = isTrigger;
      this.propsProxy.__emitter__.on('event', this.listener);
      return result;
    };

    // rewrite componentWillUnmount()
    const componentWillUnmount = this.componentWillUnmount
      ? this.componentWillUnmount.bind(this)
      : () => {};
    this.componentWillUnmount = () => {
      this.dispose();
      componentWillUnmount();
    };

    // rewrite shouldComponentUpdate
    const shouldComponentUpdate = this.shouldComponentUpdate
      ? this.shouldComponentUpdate.bind(this)
      : (nextProps: Readonly<P>, nextState: Readonly<S>) =>
          this.props !== nextProps || this.state !== nextState;
    this.shouldComponentUpdate = (nextProps, nextState, nextContext) => {
      this.theProps = nextProps;
      return shouldComponentUpdate(nextProps, nextState, nextContext);
    };
  }
}
