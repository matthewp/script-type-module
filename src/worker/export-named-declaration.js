import exportSet from './export-set.js';

export default function(node, state, cont){
  state.includeTools = true;

  if(node.source) {
    exportFrom(node, state);
  } else if(!node.declaration) {
    exportObj(node, state);
  } else {
    let name = getNameFromDeclaration(node.declaration);
    exportSet(node, state, name);
    state.exports[name] = {};
  }

  delete node.declaration;
  delete node.specifiers;

  cont(node, state);
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
    state.exports[specifier.exported.name] = {};

    let property = {
      type: 'Property',
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

function exportFrom(node, state){
  let source = node.source;
  let fromUrl = new URL(source.value, state.url).toString();
  state.deps.push(fromUrl);

  let specifiers = node.specifiers || [];
  specifiers.forEach(function(specifier){
    let local = specifier.local.name;
    let exported = specifier.exported.name;

    state.exports[exported] = {
      from: fromUrl,
      local: local
    };
  });

  node.type = 'EmptyStatement';
  delete node.source;
}
