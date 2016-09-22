export default function({ code, url, resolve, reject }){
  code += '\n//# sourceURL=' + url;
  try {
    __scriptTypeModuleEval(code);
    resolve();
  } catch(err){
    reject(err);
  }
};
