import {EventEmitter} from 'stream';

export class AccessEvent {
  name: 'get' | 'set';
  paths: string[];
  constructor(name: 'get' | 'set', paths: string[]) {
    this.name = name;
    this.paths = paths;
  }
  pathString() {
    return this.paths.join('+');
  }
}

export class Child {
  emitter: EventEmitter;
  callback: (event: AccessEvent) => void;

  constructor(
    path: string,
    emitter: EventEmitter,
    parentEmitter: EventEmitter
  ) {
    this.emitter = emitter;
    this.callback = (event: AccessEvent) => {
      parentEmitter.emit(
        'event',
        new AccessEvent(event.name, [path, ...event.paths])
      );
    };
    this.emitter.on('event', this.callback);
  }

  dispose() {
    this.emitter.off('event', this.callback);
  }
}

export class Children {
  children: {[path: string]: Child} = {};

  addChild(path: string, emitter: EventEmitter, parentEmitter: EventEmitter) {
    this.removeChild(path);
    const child = new Child(path, emitter, parentEmitter);
    this.children[path] = child;
  }

  getChild(path: string) {
    return this.children[path];
  }

  removeChild(path: string) {
    const child = this.children[path];
    if (child) {
      child.dispose();
      delete this.children[path];
    }
  }
}
