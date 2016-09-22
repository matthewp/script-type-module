import * as star from './src/star.js';

if(self.RESULT) {
  throw new Error('This module has already loaded');
}

self.RESULT = {
  foo: star.foo(),
  bar: star.bar
};
