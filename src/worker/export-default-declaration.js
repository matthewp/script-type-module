export default function(node, state){
  state.includeTools = state.includesExports = true;
  let decl = node.declaration;
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
        name: 'namedExport'
      }
    },
    arguments: [{
      type: 'Literal',
      value: 'default',
      raw: "'default'"
    }, node.declaration]
  };

  delete node.declaration;
};
