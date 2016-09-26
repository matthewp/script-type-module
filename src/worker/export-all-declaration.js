export default function(node, state){
  let source = node.source;
  let fromUrl = new URL(source.value, state.url).toString();
  state.deps.push(fromUrl);
  state.exportStars.push(fromUrl);

  node.type = 'EmptyStatement';
  delete node.source;
};
