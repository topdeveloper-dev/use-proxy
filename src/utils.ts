import {EventEmitter} from 'events';
import {emitterKey} from './constants';

export const proxyable = (obj: any) => {
  return typeof obj === 'object' && obj !== null;
};

export const getEmitter = (obj: any): EventEmitter | undefined => {
  if (!proxyable(obj)) {
    return undefined;
  }
  return Reflect.get(obj, emitterKey);
};
