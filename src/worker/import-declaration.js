
export default function(node, state){
  let url = state.url;
  state.includeTools = true;
  let source = node.source;
  let specifiers = node.specifiers || [];
  // TODO better namespace naming algo
  let namespaceName = getNamespaceName(specifiers, state);

  state.deps.push(new URL(source.value, url).toString());

  specifiers.forEach(function(node){
    switch(node.type) {
      case 'ImportDefaultSpecifier':
        state.specifiers[node.local.name] = {
          ns: namespaceName,
          type: 'default'
        };
        break;
      case 'ImportSpecifier':
        state.specifiers[node.local.name] = {
          ns: namespaceName,
          type: 'named',
          prop: node.imported.name
        };
        break;
    }
  });

  node.type = 'VariableDeclaration';
  node.kind = 'const';
  node.declarations = [
    {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name: namespaceName
      },
      init:
      {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: '_moduleTools'
          },
          property: {
            type: 'Identifier',
            name: 'staticImport'
          }
        },
        arguments: [
          {
            type: 'Literal',
            value: source.value,
            raw: source.raw
          }
        ]
      }
    }
  ];

  delete node.specifiers;
  delete node.source;
};

function getNamespaceName(specifiers, state) {
  let namespaceName;
  if(specifiers.length) {
    let specifier = specifiers[0];
    if(specifier.type == 'ImportNamespaceSpecifier') {
      namespaceName = specifier.local.name;
    } else {
      namespaceName = specifier.local.name + 'Namespace';
    }
  } else {
    namespaceName = 'anon' + state.anonCount + 'Namespace';
    state.anonCount++;
  }
  return namespaceName;
}
