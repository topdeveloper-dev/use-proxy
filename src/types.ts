export class Event {
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
