export default function(node, name){
  let rightHandSide;
  switch(node.declaration.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'Literal':
      rightHandSide = node.declaration;
      break;
    case 'AssignmentExpression':
      rightHandSide = node.declaration.right;
      break;
    default:
      rightHandSide = node.declaration.declarations[0].init;
      break;
  }

  node.type = 'ExpressionStatement',
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
};
