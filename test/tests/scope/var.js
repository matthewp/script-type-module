import {foo} from './src/foo.js';

let result = self.RESULT = {};

result.one = foo();

function bar(){
  var foo = () => 'bar';
  result.two = foo();
}
bar();

function baz(){
  let foo = function() { return 'baz' };
  result.three = foo();
}
baz();

function qux() {
  const foo = () => 'qux';
  result.four = foo();
}
qux();
