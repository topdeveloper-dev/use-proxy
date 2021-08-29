import {EventEmitter} from 'stream';

export class AccessEvent {
  name: 'get' | 'set';
  paths: PropertyKey[];
  constructor(name: 'get' | 'set', paths: PropertyKey[]) {
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
    propertyKey: PropertyKey,
    emitter: EventEmitter,
    parentEmitter: EventEmitter
  ) {
    this.emitter = emitter;
    this.callback = (event: AccessEvent) => {
      parentEmitter.emit(
        'event',
        new AccessEvent(event.name, [propertyKey, ...event.paths])
      );
    };
    this.emitter.on('event', this.callback);
  }

  dispose() {
    this.emitter.off('event', this.callback);
  }
}
