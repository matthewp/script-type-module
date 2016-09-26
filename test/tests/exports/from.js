import { a, aB } from './src/from-name.js';
import { b } from './src/from-as.js';
import * as c from './src/from-star.js';

/**
 * TODO:
 * export { a as b } from
 * export * from
 */

self.RESULT = {
  getA: function(){
    return a;
  },
  aB: aB,
  b: b,
  c: c
};
