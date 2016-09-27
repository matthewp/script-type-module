import '../vendor/escodegen.browser.js';
import acorn from './acorn.js';
import visitors from './visitors.js';
import { addModuleTools, addModuleNamespace } from './module-tools.js';
import { decode, encode } from '../msg.js';
import './source-maps.js';

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
      exportStars: [],
      exportNames: {},
      specifiers: {},
      vars: {},
      url: url
    };
    let ast = acorn.parse(src, {
      sourceType: 'module',
      locations: true,
      sourceFile: url
    });
    acorn.walk.recursive(ast, state, visitors);

    if(state.includesExports) {
      ast.body.unshift(addModuleNamespace());
    }
    if(state.includeTools) {
      ast.body.unshift(addModuleTools(url));
    }

    let result = escodegen.generate(ast, {
      sourceMap: true,
      sourceMapWithCode: true
    });
    return {
      code: result.code,
      deps: state.deps,
      exports: state.exports,
      exportStars: state.exportStars,
      map: result.map.toJSON()
    };
  })
  .then(function(res){
    postMessage(encode({
      type: 'fetch',
      exports: res.exports,
      exportStars: res.exportStars,
      deps: res.deps,
      url: url,
      src: res.code,
      map: res.map
    }));
  });
}
