import execute from './execute.js';

export default class {
  constructor() {
    this.moduleMap = new Map();
    this.moduleScriptMap = new Map();
    this.importPromises = new Map();
  }

  get(url) {
    return this.moduleScriptMap.get(url);
  }

  add(moduleScript) {
    let url = moduleScript.url;
    this.moduleScriptMap.set(url, moduleScript);
  }

  addExports(moduleScript, msg) {
    let exports = msg.exports;
    let exportStars = msg.exportStars;

    Object.keys(exports).forEach(name => {
      let exp = exports[name];
      if(exp.from) {
        let parentModuleScript = this.moduleScriptMap.get(exp.from);

        Object.defineProperty(moduleScript.namespace, name, {
          get: getValue(parentModuleScript, exp.local)
        });
      } else {
        Object.defineProperty(moduleScript.namespace, name, {
          get: getValue(moduleScript, name)
        });
      }
    });

    exportStars.forEach(from => {
      let parentModuleScript = this.moduleScriptMap.get(from);
      let props = Object.getOwnPropertyNames(parentModuleScript.namespace);
      props.forEach(function(prop){
        Object.defineProperty(moduleScript.namespace, prop, {
          get: getValue(parentModuleScript, prop)
        });
      });
    });
  }

  link(moduleScript, exports) {
    this.addExports(moduleScript, exports);
    this.moduleMap.set(moduleScript.url, moduleScript.namespace);

    execute(moduleScript);
  }
};

function getValue(moduleScript, name, par) {
  return function(){
    return moduleScript.values[name];
  };
}
