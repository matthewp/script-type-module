import nsAssignment from './namespace-assignment.js';

export default function(node, state){
  state.includeTools = state.includesExports = true;
  state.exports.push('default');

  nsAssignment(node, 'default');
  delete node.declaration;
};
