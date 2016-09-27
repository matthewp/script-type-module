export function decode(msg){
  return JSON.parse(msg);
}

export function encode(msg){
  return JSON.stringify(msg);
}
