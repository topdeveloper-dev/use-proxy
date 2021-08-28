import React from 'react';

export class Component<P = {}, S = {}> extends React.Component<P, S> {
  constructor(props: Readonly<P>) {
    super(props);
    const render = this.render.bind(this);
    this.render = () => {
      const result = render();
      return result;
    };
  }
}
