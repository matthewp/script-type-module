import { decode, encode } from '../msg.js';

class Cluster {
  constructor(count){
    this.count = count;
    this.workerURL = new URL('./worker.js', document.currentScript.src);
    this.workers = [];
    this.spawn();
  }

  post(msg, handler) {
    let worker = this.leastBusy();
    worker.handlers[msg.url] = handler;
    worker.postMessage(encode(msg));
    worker.inProgress++;
  }

  spawn() {
    for(var i = 0; i < this.count; i++) {
      let worker = new Worker(this.workerURL);
      this.handleMessages(worker);
      this.workers.push(worker);
    }
  }

  leastBusy() {
    this.workers.sort(function(a, b){
      if(a.inProgress < b.inProgress) {
        return -1;
      } else {
        return 1;
      }
    });
    return this.workers[0];
  }

  handleMessages(worker) {
    worker.inProgress = 0;
    worker.handlers = {};

    worker.onmessage = function(ev){
      let msg = decode(ev.data);
      let handler = worker.handlers[msg.url];
      handler(msg);
      worker.inProgress--;
    };
  }
}

export default Cluster;
