export default function(registry, dynamicImport){
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
      dynamicImport: function(specifier){
        let u = new URL(specifier, url).toString();
        return dynamicImport(u);
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
      },
      makeHTMLDocument: function(html){

      }
    };
  };
};
