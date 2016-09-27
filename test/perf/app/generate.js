const fs = require('fs');
const path = require('path');

const max = 500;
const deps = 10;
const first = 30;

let includeJS = process.argv[2] !== '--no-js';

let cnt = 0;

let importer = function(pth){
  return `
    import def from './${pth}';
  `;
}

let exporter = function(){
  return `
    export default function(){
    };
  `;
}

let importerExporter = function(pth){
  return `
    import def from './${pth}';

    export default function(){
    };
  `;
};

let mainTmpl = function(names){
  return `
    import './${names[0]}';
    import './${names[1]}';
    import './${names[2]}';
    import './${names[3]}';
    import './${names[4]}';
    import './${names[5]}';
    import './${names[6]}';
    import './${names[7]}';
    import './${names[8]}';
    import './${names[9]}';
  `;
}

let names = {};
function makeName(){
  let name = Math.random().toString(36).substring(7);
  if(names[name]) {
    return makeName();
  }
  names[name] = true;
  return name;
}

function makeModule(tmpl, hasChildren){
  cnt++;
  let name = makeName();
  let fn = includeJS ? name + '.js' : name;
  let pth = path.join(__dirname, 'src', name + '.js');

  let src;
  if(hasChildren && cnt < max) {
    let nextTmpl, willHaveChildren = true;
    if((cnt + 10) < max) {
      nextTmpl = importerExporter;
    } else {
      nextTmpl = exporter;
      willHaveChildren = false;
    }

    let child = makeModule(nextTmpl, willHaveChildren);
    src = tmpl(child);
  } else {
    tmpl = exporter;
    src = tmpl();
  }

  //console.log(src);
  fs.writeFileSync(pth, src, 'utf8');

  return fn;
}

let mainDeps = [];

for(var i = 0; i < first; i++) {
  let local = makeModule(importer, true);
  mainDeps.push(local);
}

let src = mainTmpl(mainDeps);
let pth = path.join(__dirname, 'src', 'main.js');
fs.writeFileSync(pth, src, 'utf8');
