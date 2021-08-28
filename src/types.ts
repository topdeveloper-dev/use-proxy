export class Event {
  name: string;
  paths: PropertyKey[];
  constructor(name: string, paths: PropertyKey[]) {
    this.name = name;
    this.paths = paths;
  }
}
