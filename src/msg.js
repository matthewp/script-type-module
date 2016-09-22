export function decode(msg){
  return JSON.parse(msg);
}

export function encode(msg){
  return JSON.stringify(msg);
}

export function send(worker, msg) {
  worker.postMessage(encode(msg));
}

export function listen(worker){
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
};
