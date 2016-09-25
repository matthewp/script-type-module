import exportSet from './export-set.js';

export default function(node, state, cont){
  if(isExportName(node, state)) {
    exportSet(node, state, node.left.name);
    return;
  }
  Object.getPrototypeOf(this).AssignmentExpression(node, state, cont);
};

function isExportName(node, state){
  let left = node.left;

  return left.type === 'Identifier' && state.exportNames[left.name];
}
