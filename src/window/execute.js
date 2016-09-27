export default function({ url, code, map, resolve, reject }){
  if(map) {
    code += encode(map);
  } else {
    code += '\n//# sourceURL=' + url;
  }

  try {
    __scriptTypeModuleEval(code);
    resolve();
  } catch(err){
    reject(err);
  }
};

const prefix = '\n//# source' + 'MappingURL=data:application/json;base64,';

function encode(map) {
  return prefix + btoa(JSON.stringify(map));
}
