import execute from './execute.js';

export class ModuleTree {
  constructor() {
    this.count = 0;
    this.fetchPromise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    })
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
    if(this.count === 0) {
      this.resolve();
    }
  }
}

export class ModuleRecord {
  constructor() {
    this.requestedModules = null;
    this.instantiationStatus = 'uninstantiated';
  }
}

export class ModuleScript {
  constructor(url, resolve, reject, tree){
    this.moduleRecord = new ModuleRecord();
    this.tree = tree;
    this.url = url;
    this.resolve = resolve;
    this.reject = reject;

    this.fetchMessage = null;
    this.deps = null;
    this.code = null;

    this.values = {};
    this.namespace = {};
  }

  addMessage(msg) {
    this.fetchMessage = msg;
    this.code = msg.src;
    this.deps = msg.deps;
  }

  complete() {
    this.resolve(this);
    this.tree.decrement();
  }

  isDepOf(moduleScript) {
    return moduleScript.deps.indexOf(this.url) !== -1;
  }

  instantiate() {
    try {
      execute(this);
      this.moduleRecord.instantiationStatus = 'instantiated';
    } catch(err) {
      this.moduleRecord.instantiationStatus = 'errored';
      throw err;
    }
  }
}
