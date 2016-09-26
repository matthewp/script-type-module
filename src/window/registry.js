import execute from './execute.js';

export default class {
  constructor() {
    this.moduleMap = new Map();
    this.moduleScriptMap = new Map();
    this.fetchPromises = new Map();
  }

  get(url) {
    return this.moduleScriptMap.get(url);
  }

  add(moduleScript) {
    let url = moduleScript.url;
    this.moduleScriptMap.set(url, moduleScript);
  }

  addExports(moduleScript) {
    let msg = moduleScript.fetchMessage;
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

  link(moduleScript) {
    let deps = moduleScript.deps;
    deps.forEach(depUrl => {
      let depModuleScript = this.get(depUrl);
      if(depModuleScript.moduleRecord.instantiationStatus === 'uninstantiated') {
        // Circular deps
        if(moduleScript.isDepOf(depModuleScript)) {
          // Go ahead and instantiate self
          this.instantiate(moduleScript);
        }
        this.link(depModuleScript);
      }
    });

    this.instantiate(moduleScript);
  }

  instantiate(moduleScript) {
    if(moduleScript.moduleRecord.instantiationStatus === 'uninstantiated') {
      this.addExports(moduleScript);
      this.moduleMap.set(moduleScript.url, moduleScript.namespace);
      moduleScript.instantiate();
    }
  }
};

function getValue(moduleScript, name, par) {
  return function(){
    return moduleScript.values[name];
  };
}
