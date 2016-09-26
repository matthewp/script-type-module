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

  addExports(moduleScript, exports) {
    Object.keys(exports).forEach(name => {
      let exp = exports[name];
      if(exp.from) {
        let parentModuleScript = this.moduleScriptMap.get(exp.from);

        Object.defineProperty(moduleScript.namespace, name, {
          get: getValue(parentModuleScript, name)
        });
      } else {
        Object.defineProperty(moduleScript.namespace, name, {
          get: getValue(moduleScript, name)
        });
      }
    });
  }

  link(moduleScript, exports) {
    this.addExports(moduleScript, exports);

    execute(moduleScript);
  }
};

function getValue(moduleScript, name, par) {
  return function(){
    return moduleScript.values[name];
  };
}
