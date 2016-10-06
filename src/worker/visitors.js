import AssignmentExpression from './assignment-expression.js';
import ExportAllDeclaration from './export-all-declaration.js';
import ExportDefaultDeclaration from './export-default-declaration.js';
import ExportNamedDeclaration from './export-named-declaration.js';
import Identifier from './identifier.js';
import ImportDeclaration from './import-declaration.js';
import ImportCallIdentifier from './import-call-identifier.js';
import Property from './property.js';

export default {
  AssignmentExpression: AssignmentExpression,
  ExportAllDeclaration: ExportAllDeclaration,
  ExportDefaultDeclaration: ExportDefaultDeclaration,
  ExportNamedDeclaration: ExportNamedDeclaration,
  ImportCallIdentifier: ImportCallIdentifier,
  ImportDeclaration: ImportDeclaration,
  Identifier: Identifier,
  FunctionExpression: functionWithLocalState('FunctionExpression'),
  FunctionDeclaration: functionWithLocalState('FunctionDeclaration'),
  ArrowFunctionExpression: functionWithLocalState('ArrowFunctionExpression'),
  Property: Property,
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
