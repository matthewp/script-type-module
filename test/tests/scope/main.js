import {foo} from './src/foo.js';

let result = self.RESULT = {};

result.one = foo();

function bar(foo){
  result.two = foo();
}

bar(function(){
  return 'bar';
});

let qux = (foo) => {
  result.three = foo();
};

qux(function(){
  return 'qux';
});

let baz = function(foo){
  result.four = foo();
};

baz(() => 'baz');
