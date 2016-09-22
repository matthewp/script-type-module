import nsAssignment from './namespace-assignment.js';

export default function(node, state){
  state.includeTools = state.includesExports = true;

  nsAssignment(node, 'default');
  delete node.declaration;
};
