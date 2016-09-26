__scriptTypeModuleEval = function(__moduleSrc){
  eval(__moduleSrc);
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

function decode(msg){
  return JSON.parse(msg);
}

function encode(msg){
  return JSON.stringify(msg);
}

function send(worker, msg) {
  worker.postMessage(encode(msg));
}

function listen(worker){
  let messageCallbacks = [];
  worker.onmessage = function(ev){
    let msg = decode(ev.data), cb;
    for(let i = 0, len = messageCallbacks.length; i < len; i++) {
      cb = messageCallbacks[i];
      if(cb(msg)) {
        messageCallbacks.splice(i, 1);
        break;
      }
    }
  };

  return function(cb){
    messageCallbacks.push(cb);
  };
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

var spawn = function(){
  let workerURL = new URL('./worker.js', document.currentScript.src);
  return new Worker(workerURL);
}

var execute = function({ code, url, resolve, reject }){
  code += '\n//# sourceURL=' + url;
  try {
    __scriptTypeModuleEval(code);
    resolve();
  } catch(err){
    reject(err);
  }
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
    this.values = {};
    this.namespace = {};
  }

  addMessage(msg) {
    this.fetchMessage = msg;
    this.code = msg.src;
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
  let worker = spawn();

  let registry = new Registry();
  let forEach = Array.prototype.forEach;
  let anonCount = 0;

  addModuleTools(registry);

  let filter = listen(worker);

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
        send(worker, {
          type: 'fetch',
          url: url,
          src: src
        });
        registry.add(moduleScript);
        filter(function(msg){
          if(msg.type === 'fetch' && msg.url === url) {
            moduleScript.addMessage(msg);
            fetchTree(moduleScript, tree);
            moduleScript.complete();
            return true;
          }
        });
      });
      registry.fetchPromises.set(url, promise);
    }
    return promise;
  }

  function fetchTree(moduleScript, tree) {
    let deps = moduleScript.fetchMessage.deps;
    let promises = deps.map(function(url){
      return fetchModule(url, null, tree);
    });
    return Promise.all(promises);
  }

  importExisting(importScript);
  observe(importScript);
}

}());
