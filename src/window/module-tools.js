export default function(registry){
  self._importTypeModuleTools = function(url){
    let moduleScript = registry.get(url);
    let namespace = moduleScript.namespace;
    return {
      namespace: namespace,
      staticImport: function(specifier){
        let u = new URL(specifier, url).toString();
        let ns = registry.moduleMap.get(u);
        return ns;
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
};
