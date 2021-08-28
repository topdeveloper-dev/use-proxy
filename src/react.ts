import React from 'react';

import {getEmitter} from './utils';
import {Event} from './types';
import {useProxy} from '.';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  constructor(props: Readonly<P>) {
    super(props);
    const render = this.render.bind(this);
    this.render = () => {
      const proxy = useProxy(props);
      const emitter = getEmitter(proxy)!;
      const events: Event[] = [];
      emitter.on('event', (event: Event) => {
        events.push(event);
      });
      const result = render();
      emitter.removeAllListeners();
      emitter.on('event', (event: Event) => {
        if (event.name === 'set') {
          this.forceUpdate();
          emitter.removeAllListeners();
        }
      });
      return result;
    };
  }
}
