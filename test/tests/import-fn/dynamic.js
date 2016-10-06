import foo from './src/foo.js';

let barPromise = import('./src/bar.js');
let quxPromise = import('./src/qux.js').then(function(qux){
  return qux;
});

self.RESULT = {
  foo: foo,
  bar: barPromise,
  qux: quxPromise
};
