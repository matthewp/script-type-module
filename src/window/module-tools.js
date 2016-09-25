export default function(moduleMap){
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
};
