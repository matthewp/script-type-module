export default function({ url, code, map }){
  if(map) {
    code += encode(map);
  } else {
    code += '\n//# sourceURL=' + url;
  }

   __scriptTypeModuleEval(code);
};

const prefix = '\n//# source' + 'MappingURL=data:application/json;base64,';

function encode(map) {
  return prefix + btoa(JSON.stringify(map));
}
