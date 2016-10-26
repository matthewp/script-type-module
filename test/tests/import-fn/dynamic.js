import foo from './src/foo.js';

let barPromise = import('./src/bar.js');
let quxPromise = import('./src/qux.js').then(function(qux){
  return qux;
});
let pageUrl = new URL('./tests/import-fn/src/baz.js', document.baseURI);
let bazPromise = import(pageUrl);

self.RESULT = {
  foo: foo,
  bar: barPromise,
  baz: bazPromise,
  qux: quxPromise
};
