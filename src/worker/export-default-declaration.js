import exportSet from './export-set.js';

export default function(node, state, cont){
  state.includeTools = state.includesExports = true;
  state.exports.default = {};

  exportSet(node, state, 'default');
  delete node.declaration;

  cont(node, state);
};
