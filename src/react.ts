// eslint-disable-next-line node/no-unpublished-import
import React, {useReducer} from 'react';

import {useProxy, run, releaseChildren, ProxyType} from '.';
import {ProxyEvent} from './models';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
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

    // rewrite render()
    const render = this.render.bind(this);
    this.render = () => {
      this.dispose();
      this.propsProxy = useProxy(this.props);
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
  }
}

export const autoUpdate = (Element: Function) => {
  const NewElement = (props: any) => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const proxy = useProxy(props);
    const [result, isTrigger] = run(proxy, () => Element(props));
    const listener = (event: ProxyEvent) => {
      if (isTrigger(event)) {
        proxy.__emitter__.off('event', listener);
        forceUpdate();
      }
    };
    proxy.__emitter__.on('event', listener);
    return result;
  };
  return NewElement;
};
