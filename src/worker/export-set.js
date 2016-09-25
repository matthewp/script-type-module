export default function(node, state, name){
  state.exportNames[name] = true;

  let nameArg = {
    type: 'Literal',
    value: name,
    raw: "'" + name + "'"
  };

  let valueArg;

  let decl = node.declaration || node;
  switch(decl.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'Literal':
      valueArg = decl;
      break;
    case 'AssignmentExpression':
      valueArg = decl.right;
      break;
    default:
      valueArg = decl.declarations[0].init;
      // No assignment
      if(valueArg == null) {
        valueArg = { type: 'Identifier', name: 'undefined' };
      }
      break;
  }

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
    arguments: [nameArg, valueArg]
  };
};
