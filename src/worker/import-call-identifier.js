
export default function(node, state, cont){
  delete node.name;

  node.type = 'MemberExpression';
  node.object = {
    type: 'Identifier',
    name: '_moduleTools'
  };
  node.property = {
    type: 'Identifier',
    name: 'dynamicImport'
  };
};
