// This should be a SyntaxError according to
// https://github.com/domenic/proposal-dynamic-import/issues/15

let barPromise = import('./src/bar.js', { something: 'else' });

self.RESULT = {
  bar: barPromise
};
