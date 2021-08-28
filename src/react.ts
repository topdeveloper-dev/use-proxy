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
      const getPaths = [
        ...new Set(
          events
            .filter(event => event.name === 'get')
            .map(event => event.pathString())
        ),
      ];
      emitter.on('event', (event: Event) => {
        if (event.name === 'set') {
          const setPath = event.pathString();
          if (getPaths.some(getPath => getPath.startsWith(setPath))) {
            // if setPath is short than getPath, then it's time to refresh
            this.forceUpdate();
            emitter.removeAllListeners();
          }
        }
      });
      return result;
    };
  }
}
