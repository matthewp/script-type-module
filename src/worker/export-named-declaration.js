import nsAssignment from './namespace-assignment.js';

export default function(node, state){
  state.includeTools = state.includesExports = true;
  let name = getNameFromDeclaration(node.declaration);

  nsAssignment(node, name);

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
