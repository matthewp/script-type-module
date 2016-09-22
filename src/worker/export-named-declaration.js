export default function(node, state){
  state.includeTools = state.includesExports = true;
  let name = getNameFromDeclaration(node.declaration);

  let rightHandSide;
  switch(node.declaration.type) {
    case 'FunctionDeclaration':
      rightHandSide = node.declaration;
      break;
    default:
      rightHandSide = node.declaration.declarations[0].init;
      break;
  }

  node.type = 'ExpressionStatement';
  node.expression = {
    type: "AssignmentExpression",
    operator: "=",
    left: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: "_moduleNamespace"
      },
      property: {
        type: "Identifier",
        name: name
      },
      "computed": false
    },
    right: rightHandSide
  };

  /*
  node.type = 'ExpressionStatement'
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
        name: 'namedExport'
      }
    },
      arguments: [{
      type: 'Literal',
      value: name,
      raw: "'" + name + "'"
    }, node.declaration]
  };*/

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
