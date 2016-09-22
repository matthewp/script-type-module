importScripts('./node_modules/acorn/dist/acorn.js');
importScripts('./node_modules/acorn/dist/walk.js');
importScripts('./vendor/escodegen.browser.js');

const { acorn } = self;

function makeVisitors(url){
  return {
    ImportDeclaration: function(node, state){
      state.includeTools = true;
      let source = node.source;
      let specifiers = node.specifiers || [];
      // TODO better namespace naming algo
      let namespaceName = specifiers[0].local.name + 'Namespace';
      state.deps.push(new URL(source.value, url).toString());

      specifiers.forEach(function(node){
        switch(node.type) {
          case 'ImportDefaultSpecifier':
            state.specifiers[node.local.name] = {
              ns: namespaceName,
              type: 'default'
            };
            break;
        }
      });

      node.type = 'VariableDeclaration';
      node.kind = 'const';
      node.declarations = [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: namespaceName
          },
          init:
          {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: '_moduleTools'
              },
              property: {
                type: 'Identifier',
                name: 'staticImport'
              }
            },
            arguments: [
              {
                type: 'Literal',
                value: source.value,
                raw: source.raw
              }
            ]
          }
        }
      ];

      delete node.specifiers;
      delete node.source;
    },
    ExportDefaultDeclaration: function(node, state){
      state.includeTools = true;
      let decl = node.declaration;
      node.type = 'CallExpression';
      node.callee = {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: '_moduleTools'
        },
        property: {
          type: 'Identifier',
          name: 'defaultExport'
        }
      };
      node.arguments = [node.declaration];
      delete node.declaration;
    },
    Identifier: function(node, state){
      let specifier = state.specifiers[node.name];
      if(specifier) {
        let prop = specifier.type === 'default' ? 'default': 'PROP';
        node.type = 'MemberExpression';
        node.object = {
          type: 'Identifier',
          name: specifier.ns
        };
        node.property = {
          type: 'Identifier',
          name: prop
        };
        node.computed = false;
        delete node.name;
      }
    }
  };
}

function addModuleTools(url){
  return {
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: "_moduleTools"
        },
        init: {
          "type": "CallExpression",
          "callee": {
            type: 'Identifier',
            name: '_importTypeModuleTools'
          },
          arguments: [
            {
              "type": "Literal",
              "value": url,
              "raw": "'" + url + "'"
            }
          ]
        }
      }
    ]
  };
}

onmessage = function(ev){
  let msg = decode(ev.data);
  let url = msg.url;

  fetch(url)
  .then(function(resp){
    return resp.text();
  })
  .then(function(src){
    let state = {
      deps: [],
      specifiers: {}
    };
    let visitors = makeVisitors(url);
    let ast = acorn.parse(src, { sourceType: 'module' });
    acorn.walk.simple(ast, visitors, null, state);

    if(state.includeTools) {
      ast.body.unshift(addModuleTools(url));
    }

    let code = escodegen.generate(ast);
    return {
      deps: state.deps,
      code: code
    };
  })
  .then(function(res){
    postMessage(encode({
      type: 'fetch',
      deps: res.deps,
      url: url,
      src: res.code
    }));
  });
}

function decode(msg){
  return JSON.parse(msg);
}

function encode(msg){
  return JSON.stringify(msg);
}
