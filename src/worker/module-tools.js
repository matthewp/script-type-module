export function addModuleTools(url){
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
          type: "CallExpression",
          callee: {
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
};

export function addModuleNamespace(url){
  return {
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: "_moduleNamespace"
        },
        init: {
          type: "MemberExpression",
          object: {
            type: "Identifier",
            name: "_moduleTools"
          },
          property: {
            type: "Identifier",
            name: "namespace"
          },
          computed: false
        }
      }
    ],
    kind: "const"
  };
};

export function addStrictMode() {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict',
      raw: '"use strict"'
    }
  };
}
