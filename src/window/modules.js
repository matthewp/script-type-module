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
  constructor(url, resolve, reject){
    this.moduleRecord = new ModuleRecord();
    this.status = 'fetching';
    this.baseTree = null;
    this.trees = new Set();
    this.url = url;
    this.resolve = resolve;
    this.reject = reject;
    this._instantiationPromise = null;

    this.fetchMessage = null;
    this.deps = null;
    this.code = null;

    this.values = {};
    this.namespace = {};
  }

  addToTree(tree) {
    if(!this.trees.has(tree)) {
      this.trees.add(tree);
      if(this.status === 'fetching') {
        tree.increment();
      }
      if(!this.baseTree) {
        this.baseTree = tree;
      }
    }
  }

  addMessage(msg) {
    this.status = 'fetched';
    this.fetchMessage = msg;
    this.code = msg.src;
    this.map = msg.map;
    this.deps = msg.deps;
  }

  complete() {
    this.resolve(this);
    this.trees.forEach(function(tree){
      tree.decrement();
    });
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
      this.moduleRecord.errorReason = err;
      throw err;
    }
  }

  instantiatePromise() {
    if(this._instantiationPromise) {
      return this._instantiationPromise;
    }
    return this._instantiationPromise = this._getInstantiatePromise();
  }

  _getInstantiatePromise() {
    switch(this.moduleRecord.instantiationStatus) {
      case 'instantiated':
        return Promise.resolve();
      case 'errored':
        return Promise.reject(this.moduleRecord.errorReason);
      default:
        let tree = this.baseTree;
        return tree.fetchPromise.then(() => {
          // Wait for it to execute
          return this._getInstantiatePromise();
        });
    }
  }
}
