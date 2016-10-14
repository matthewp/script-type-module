export default function(node, state){
  let specifier = state.specifiers[node.name];

  if(specifier && !hasLocal(state, node.name)) {
    if(specifier.type === 'star') {
      node.name = specifier.ns;
    } else {
      let prop = specifier.type === 'default' ? 'default': specifier.prop;
      node.type = 'MemberExpression';
      node.object = {
        type: 'Identifier',
        name: specifier.ns
      };
      node.property = {
        type: 'Identifier',
        name: prop
      };
      node.computed = false;
      delete node.name;
    }
  }
};

function hasLocal(state, name) {
  return state.vars[name];
}
