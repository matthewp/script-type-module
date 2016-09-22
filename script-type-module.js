__scriptTypeModuleEval = function(src){
  eval(src);
};

(function(self){
  let moduleMap = new Map();
  let importPromises = new Map();
  let workPromises = new Map();
  let forEach = Array.prototype.forEach;
  let anonCount = 0;

  self._importTypeModuleTools = function(url){
    let namespace = {};
    moduleMap.set(url, namespace);
    return {
      staticImport: function(specifier){
        let u = new URL(specifier, url).toString();
        let ns = moduleMap.get(u);
        return ns;
      },
      namedExport: function(name, value){
        namespace[name] = value;
      }
    };
  };

  let workerURL = new URL('./worker.js', document.currentScript.src);
  let worker = new Worker(workerURL);

  function messageWorker(msg) {
    worker.postMessage(encode(msg));
  }

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

  function filterMessages(cb){
    messageCallbacks.push(cb);
  }

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
        messageWorker({
          type: 'fetch',
          url: url,
          src: src
        });
        filterMessages(function(msg){
          if(msg.type === 'fetch' && msg.url === url) {
            handleFetch(msg, resolve, reject);
            return true;
          }
        });
      });
      importPromises.set(url, promise);
    }
    return promise;
  }

  function decode(msg){
    return JSON.parse(msg);
  }

  function encode(msg){
    return JSON.stringify(msg);
  }

  function handleFetch(msg, resolve, reject){
    let src = msg.src;
    let deps = msg.deps;

    function onsuccess(){
      src += '\n//# sourceURL=' + msg.url;
      try {
        __scriptTypeModuleEval(src);
        resolve();
      } catch(err){
        reject(err);
      }
    }

    Promise.all(deps.map(function(url){
      return importModule(url);
    }))
    .then(onsuccess, reject);
  }


  let tags = document.querySelectorAll('script[type=module]');
  forEach.call(tags, importScript);

  var mo = new MutationObserver(function(mutations){
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
  })
})(window);
