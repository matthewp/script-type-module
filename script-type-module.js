__scriptTypeModuleEval = function(src){
  eval(src);
};

(function(){
  var moduleMap = {};
  var importPromises = {};
  var importExp = /import .+ from ['"](.+)['"]/g;
  var exportDefaultExp = /export default/;
  var importFromExp = /import ([A-Za-z0-9]+) from ["'](.+)["']/g;
  var slice = Array.prototype.slice;

  var tags = slice.call(document.querySelectorAll('script[type=module]'));
  tags.forEach(importScript);

  function importScript(script) {
    return importModule(script.src);
  }

  function importModule(src) {
    var value = moduleMap[src];
    if(value === "fetching") {
      return importPromises[src];
    } else if(typeof value === "object") {
      return Promise.resolve(value);
    }

    moduleMap[src] = "fetching";

    return importPromises[src] =
    fetch(src)
    .then(function(resp){
      return resp.text();
    })
    .then(function(text){
      var deps = importsAll(text);

      return Promise.all(
        deps.map(function(pth){
          var url = new URL(pth, src).href;
          return importModule(url);
        })
      ).then(function(){
        return text;
      });
    })
    .then(function(source){
      // ready to execute
      source = source
        .replace(exportDefaultExp, "exports.default = ")
        .replace(importFromExp, function(str, name, pth){
          return "var " + name + " = require('" + pth + "').default";
        });

      var removeShim = createShim(src);
      __scriptTypeModuleEval(source + "\n//# sourceURL=" + src);
      var mod = removeShim();
      moduleMap[src] = mod.exports;
    });
  }

  function importsAll(str) {
    return regexAll(importExp, str).map(function(res){
      return res[1];
    });
  }

  function regexAll(exp, str){
    var results = [];
    var res = exp.exec(str);

    while(res) {
      results.push(res);

      res = exp.exec(str);
    }

    exp.lastIndex = 0;

    return results;
  }

  function createShim(base){
    var mod = window.module = {exports:{}};
    window.exports = mod.exports;

    window.require = function(pth){
      var key = new URL(pth, base).href;
      return moduleMap[key];
    };

    return function(){
      delete window.module;
      delete window.exports;
      delete window.require;
      return mod;
    };
  }

})();
