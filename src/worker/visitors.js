import ImportDeclaration from './import-declaration.js';
import ExportDefaultDeclaration from './export-default-declaration.js';
import ExportNamedDeclaration from './export-named-declaration.js';
import Identifier from './identifier.js';

export default {
  ExportDefaultDeclaration: ExportDefaultDeclaration,
  ExportNamedDeclaration: ExportNamedDeclaration,
  ImportDeclaration: ImportDeclaration,
  Identifier: Identifier,
  FunctionExpression: functionWithLocalState('FunctionExpression'),
  FunctionDeclaration: functionWithLocalState('FunctionDeclaration'),
  ArrowFunctionExpression: functionWithLocalState('ArrowFunctionExpression'),
  //VariableDeclaration: variableAddToState('var')
  VariableDeclarator: VariableDeclarator
};

function functionWithLocalState(fnType){
  return function(node, state, cont){
    let localState = Object.assign({}, state, {
      vars: Object.assign({}, state.vars)
    });
    if(node.params) {
      node.params.forEach(function(node){
        localState.vars[node.name] = true;
      });
    }
    Object.getPrototypeOf(this)[fnType](node, localState, cont);
  };
}

function VariableDeclarator(node, state, cont){
  state.vars[node.id.name] = true;
  Object.getPrototypeOf(this).VariableDeclarator(node, state, cont);
}
