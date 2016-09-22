export function hasNativeSupport(){
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
