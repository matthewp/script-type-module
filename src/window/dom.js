const forEach = Array.prototype.forEach;

export function importExisting(importScript){
  let tags = document.querySelectorAll('script[type=module]');
  forEach.call(tags, importScript);
}

export function observe(importScript) {
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
