import exportSet from './export-set.js';

export default function(node, state){
  state.includeTools = state.includesExports = true;
  state.exports.push('default');

  exportSet(node, state, 'default');
  delete node.declaration;
};
