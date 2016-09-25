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

var addModuleTools = function(moduleMap){
  self._importTypeModuleTools = function(url){
    let namespace = {};
    moduleMap.set(url, namespace);
    return {
      namespace: namespace,
      staticImport: function(specifier){
        let u = new URL(specifier, url).toString();
        let ns = moduleMap.get(u);
        return ns;
      },
      namedExport: function(name, value){
        namespace[name] = value;
      },
      set: function(name, value) {
        if(typeof name === 'object') {
          let moduleTools = this;
          Object.keys(name).forEach(function(key){
            moduleTools.set(key, name[key]);
          });
          return;
        }
        namespace[name] = value;
        return value;
      }
    };
  };
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

// TODO saving this space in case I want to support multiple workers

var spawn = function(){
  let workerURL = new URL('./worker.js', document.currentScript.src);
  return new Worker(workerURL);
}

class ModuleRecord {
  constructor() {
    this.requestedModules = null;
  }
}

class ModuleScript {
  constructor(url, resolve, reject){
    this.moduleRecord = new ModuleRecord();
    this.url = url;
    this.resolve = resolve;
    this.reject = reject;
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

if(!hasNativeSupport()) {
  let worker = spawn();

  let moduleMap = new Map();
  let importPromises = new Map();
  let workPromises = new Map();
  let forEach = Array.prototype.forEach;
  let anonCount = 0;

  addModuleTools(moduleMap);

  let filter = listen(worker);

  function importScript(script) {
    let url = "" + (script.src || new URL('./!anonymous_' + anonCount++, document.baseURI));
    let src = script.src ? undefined : script.textContent;

    // TODO what about inline modules
    return importModule(url, src)
    .then(function(){
      var ev = new Event('load');
      script.dispatchEvent(ev);
    })
    .then(null, function(err){
      console.error(err);
    });
  }

  function importModule(url, src) {
    var value = moduleMap.get(url);
    var promise;
    if(value === "fetching") {
      promise = importPromises.get(url);
    } else if(typeof value === "object") {
      promise = Promise.resolve(value);
    } else {
      promise = new Promise(function(resolve, reject){
        let moduleScript = new ModuleScript(url, resolve, reject);
        send(worker, {
          type: 'fetch',
          url: url,
          src: src
        });
        filter(function(msg){
          if(msg.type === 'fetch' && msg.url === url) {
            handleFetch(msg, moduleScript);
            return true;
          }
        });
      });
      importPromises.set(url, promise);
    }
    return promise;
  }

  function handleFetch(msg, moduleScript){
    let src = moduleScript.code = msg.src;
    let deps = msg.deps;

    Promise.all(deps.map(function(url){
      return importModule(url);
    }))
    .then(function(){
      execute(moduleScript);
    }, moduleScript.reject);
  }

  importExisting(importScript);
  observe(importScript);
}

}());
