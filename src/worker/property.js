import { assign } from './utils.js';

export default function(node, state, cont) {
  if(node.shorthand) {
    let key = node.key.name;
    let specifier = state.specifiers[key];
    if(specifier && !state.vars[key]) {
      node.shorthand = false;
      node.key = assign({}, node.key);
    }
  }
  Object.getPrototypeOf(this).Property(node, state, cont);
};
