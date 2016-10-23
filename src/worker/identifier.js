export default function(node, state){
  let specifier = state.specifiers[node.name];
  let localVar = hasLocal(state, node.name);

  if(specifier && !localVar) {
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
  } else if(state.exports[node.name] && !localVar) {
    node.type = 'MemberExpression';
    node.object = {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: '_moduleTools'
      },
      property: {
        type: 'Identifier',
        name: 'namespace'
      },
      computed: false
    };
    node.property = {
      type: 'Identifier',
      name: node.name
    };
    node.computed = false;
    delete node.name;
  }
};

function hasLocal(state, name) {
  return state.vars[name];
}
