__scriptTypeModuleEval = function(__moduleSrc){
  new Function(__moduleSrc)();
};
(function () {
'use strict';

function hasNativeSupport(){
  var script = document.createElement('script');
  script.type = 'module';
  var tempVar = '_scriptModuleSupported';
  script.textContnet = 'window._scriptModuleSupported = true;';
  document.head.appendChild(script);
  document.head.appendChild(script);
  var val = !!window[tempVar];
  delete window[tempVar];
  script.parentNode.removeChild(script);
  return val;
}

function currentScript() {
  return document.currentScript || document._currentScript || getCurrentScriptTheHardWay();
}

function getCurrentScriptTheHardWay() {
  // Should be more complex than this.
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
}

function decode(msg){
  return JSON.parse(msg);
}

function encode(msg){
  return JSON.stringify(msg);
}

class Cluster {
  constructor(count){
    this.count = count;
    this.workerURL = new URL('./worker.js', document.currentScript.src);
    this.workers = [];
    this.spawn();
  }

  post(msg, handler) {
    let worker = this.leastBusy();
    worker.handlers[msg.url] = handler;
    worker.postMessage(encode(msg));
    worker.inProgress++;
  }

  spawn() {
    for(var i = 0; i < this.count; i++) {
      let worker = new Worker(this.workerURL);
      this.handleMessages(worker);
      this.workers.push(worker);
    }
  }

  leastBusy() {
    this.workers.sort(function(a, b){
      if(a.inProgress < b.inProgress) {
        return -1;
      } else {
        return 1;
      }
    });
    return this.workers[0];
  }

  handleMessages(worker) {
    worker.inProgress = 0;
    worker.handlers = {};

    worker.onmessage = function(ev){
      let msg = decode(ev.data);
      let handler = worker.handlers[msg.url];
      handler(msg);
      worker.inProgress--;
    };
  }
}

var addModuleTools = function(registry){
  self._importTypeModuleTools = function(url){
    let moduleScript = registry.get(url);
    let namespace = moduleScript.namespace;
    return {
      namespace: namespace,
      staticImport: function(specifier){
        let u = new URL(specifier, url).toString();
        let moduleScript = registry.get(u);
        return moduleScript.namespace;
      },
      namedExport: function(name, value){
        throw new Error('This is not implemented currently.');
        //namespace[name] = value;
      },
      set: function(name, value) {
        if(typeof name === 'object') {
          let moduleTools = this;
          Object.keys(name).forEach(function(key){
            moduleTools.set(key, name[key]);
          });
          return;
        }
        moduleScript.values[name] = value;
        return value;
      }
    };
  };
}

// TODO saving this space in case I want to support multiple workers

var execute = function({ url, code, map }){
  if(map) {
    code += encode$1(map);
  } else {
    code += '\n//# sourceURL=' + url;
  }

   __scriptTypeModuleEval(code);
}

const prefix = '\n//# source' + 'MappingURL=data:application/json;base64,';

function encode$1(map) {
  return prefix + btoa(JSON.stringify(map));
}

class ModuleTree {
  constructor() {
    this.count = 0;
    this.fetchPromise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
    if(this.count === 0) {
      this.resolve();
    }
  }
}

class ModuleRecord {
  constructor() {
    this.requestedModules = null;
    this.instantiationStatus = 'uninstantiated';
  }
}

class ModuleScript {
  constructor(url, resolve, reject, tree){
    this.moduleRecord = new ModuleRecord();
    this.tree = tree;
    this.url = url;
    this.resolve = resolve;
    this.reject = reject;

    this.fetchMessage = null;
    this.deps = null;
    this.code = null;

    this.values = {};
    this.namespace = {};
  }

  addMessage(msg) {
    this.fetchMessage = msg;
    this.code = msg.src;
    this.map = msg.map;
    this.deps = msg.deps;
  }

  complete() {
    this.resolve(this);
    this.tree.decrement();
  }

  isDepOf(moduleScript) {
    return moduleScript.deps.indexOf(this.url) !== -1;
  }

  instantiate() {
    try {
      execute(this);
      this.moduleRecord.instantiationStatus = 'instantiated';
    } catch(err) {
      this.moduleRecord.instantiationStatus = 'errored';
      throw err;
    }
  }
}

const forEach = Array.prototype.forEach;

function importExisting(importScript){
  let tags = document.querySelectorAll('script[type=module]');
  forEach.call(tags, importScript);
}

function observe(importScript) {
  let mo = new MutationObserver(function(mutations){
    forEach.call(mutations, function(mutation){
      forEach.call(mutation.addedNodes, function(el){
        if(el.nodeName === 'SCRIPT' && el.type === 'module') {
          importScript(el);
        }
      });
    });
  });
  mo.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  return mo;
}

var Registry = class {
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
}

function getValue(moduleScript, name, par) {
  return function(){
    return moduleScript.values[name];
  };
}

if(!hasNativeSupport()) {
  let cluster = new Cluster(1);

  let registry = new Registry();
  let forEach = Array.prototype.forEach;
  let anonCount = 0;
  let pollyScript = currentScript();
  let includeSourceMaps = pollyScript.dataset.noSm == null;

  addModuleTools(registry);

  function importScript(script) {
    let url = "" + (script.src || new URL('./!anonymous_' + anonCount++, document.baseURI));
    let src = script.src ? undefined : script.textContent;

    return importModule(url, src)
    .then(function(){
      var ev = new Event('load');
      script.dispatchEvent(ev);
    })
    .then(null, function(err){
      console.error(err);
      var ev = new ErrorEvent('error', {
        message: err.message,
        filename: url
      });
      script.dispatchEvent(ev);
    });
  }

  function importModule(url, src){
    let tree = new ModuleTree();

    return fetchModule(url, src, tree)
    .then(function(moduleScript){
      return tree.fetchPromise.then(function(){
        return moduleScript;
      });
    })
    .then(function(moduleScript){
      registry.link(moduleScript);
    });
  }

  function fetchModule(url, src, tree) {
    var promise = registry.fetchPromises.get(url);
    if(!promise) {
      promise = new Promise(function(resolve, reject){
        let moduleScript = new ModuleScript(url, resolve, reject, tree);
        tree.increment();
        let handler = function(msg){
          moduleScript.addMessage(msg);
          fetchTree(moduleScript, tree);
          moduleScript.complete();
        };
        cluster.post({
          type: 'fetch',
          url: url,
          src: src,
          includeSourceMaps: includeSourceMaps
        }, handler);
        registry.add(moduleScript);
      });
      registry.fetchPromises.set(url, promise);
    }
    return promise;
  }

  function fetchTree(moduleScript, tree) {
    let deps = moduleScript.deps;
    let promises = deps.map(function(url){
      return fetchModule(url, null, tree);
    });
    return Promise.all(promises);
  }

  importExisting(importScript);
  observe(importScript);
}

}());
