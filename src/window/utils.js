export function currentScript() {
  return document.currentScript || document._currentScript || getCurrentScriptTheHardWay();
}

function getCurrentScriptTheHardWay() {
  // Should be more complex than this.
  var scripts = document.getElementsByTagName('script');
  return scripts[scripts.length - 1];
}
