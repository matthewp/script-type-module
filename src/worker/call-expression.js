export default function(node, state, cont) {
  // Handle incorrect arguments for dynamic import()
  if(node.callee.type === 'ImportCallIdentifier') {
    if(node.arguments.length !== 1) {
      throw new SyntaxError('import() only takes a single argument');
    }

    // SpreadElement is disallowed
    let argType = node.arguments[0].type;
    if(argType === 'SpreadElement') {
      throw new SyntaxError('Spread syntax not allowed in import()');
    }
  }

  return Object.getPrototypeOf(this).CallExpression(node, state, cont);
};
