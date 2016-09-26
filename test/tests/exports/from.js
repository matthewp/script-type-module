import { a, aB } from './src/from-name.js';

/**
 * TODO:
 * export { a as b } from
 * export * from
 */

self.RESULT = {
  getA: function(){
    return a;
  },
  aB: aB
};
