// eslint-disable-next-line node/no-unpublished-import
import React from 'react';

import {useProxy, runAndMonitor} from '.';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  constructor(props: Readonly<P>) {
    super(props);
    const render = this.render.bind(this);
    this.render = () => {
      const [, emitter] = useProxy(props);
      const [result, newEmitter] = runAndMonitor(emitter, render);
      newEmitter.once('event', () => {
        this.forceUpdate();
        emitter.removeAllListeners();
      });
      return result;
    };
  }
}
