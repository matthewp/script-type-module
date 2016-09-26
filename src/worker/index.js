import '../vendor/escodegen.browser.js';
import acorn from './acorn.js';
import visitors from './visitors.js';
import { addModuleTools, addModuleNamespace } from './module-tools.js';
import { decode, encode } from '../msg.js';

onmessage = function(ev){
  let msg = decode(ev.data);
  let url = msg.url;

  let fetchPromise = msg.src ? Promise.resolve(msg.src)
    : fetch(url).then(function(resp){
      return resp.text();
    });

  fetchPromise
  .then(function(src){
    let state = {
      anonCount: 0,
      deps: [],
      exports: {},
      exportNames: {},
      specifiers: {},
      vars: {},
      url: url
    };
    let ast = acorn.parse(src, { sourceType: 'module' });
    acorn.walk.recursive(ast, state, visitors);

    if(state.includesExports) {
      ast.body.unshift(addModuleNamespace());
    }
    if(state.includeTools) {
      ast.body.unshift(addModuleTools(url));
    }

    let code = escodegen.generate(ast);
    return {
      code: code,
      deps: state.deps,
      exports: state.exports
    };
  })
  .then(function(res){
    postMessage(encode({
      type: 'fetch',
      exports: res.exports,
      deps: res.deps,
      url: url,
      src: res.code
    }));
  });
}
