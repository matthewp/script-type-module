import exportSet from './export-set.js';

export default function(node, state){
  state.includeTools = state.includesExports = true;

  if(!node.declaration) {
    exportObj(node, state);
  } else {
    let name = getNameFromDeclaration(node.declaration);
    exportSet(node, state, name);
  }

  delete node.declaration;
  delete node.specifiers;
};

function getNameFromDeclaration(decl) {
  switch(decl.type) {
    case 'FunctionDeclaration':
    case 'VariableDeclarator':
      return decl.id.name;
    case 'VariableDeclaration':
      return getNameFromDeclaration(decl.declarations[0]);
  }
}

function exportObj(node, state) {
  let objectExpression = {
    type: 'ObjectExpression',
    properties: []
  };

  node.specifiers.forEach(function(specifier){
    state.exports.push(specifier.exported.name);
    let property = {
      types: 'Property',
      method: false,
      shorthand: false,
      computed: false,
      key: {
        type: 'Identifier',
        name: specifier.exported.name
      },
      value: {
        type: 'Identifier',
        name: specifier.local.name
      },
      kind: 'init'
    };
    objectExpression.properties.push(property);
  });

  node.type = 'ExpressionStatement';
  node.expression = {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: '_moduleTools'
      },
      property: {
        type: 'Identifier',
        name: 'set'
      },
      computed: false
    },
    arguments: [objectExpression]
  };
}
