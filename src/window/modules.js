export class ModuleRecord {
  constructor() {
    this.requestedModules = null;
  }
}

export class ModuleScript {
  constructor(url, resolve, reject){
    this.moduleRecord = new ModuleRecord();
    this.url = url;
    this.resolve = resolve;
    this.reject = reject;

    this.values = {};
    this.namespace = {};
  }

  set() {

  }
}
