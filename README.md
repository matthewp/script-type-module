# <script type=module> - the polyfill!

***Note*** this is a proof of concept only, don't actually try to use it. However, it does demonstrate that the tag can be polyfilled without much code.

Currently this only supports:

* `import a from 'b'` type of imports
* `export default function()...` type of exports

This is because my regular expressions are very simple. If you'd like to contribute, expanding support for all of the various import/export syntaxes would be huge, my regex skills aren't great.

See the `demo/` folder for a working example.

***Also note*** this doesn't attempt to feature detect if the browser supports script type=module (which none do currently) and I'm not sure if feature detecting that is even possible.

## Install

```
npm install script-type-module
```

## Use

```html
<script src="./node_modules/script-type-module/script-type-module.js"></script>
<script type="module" src="./foo.js"></script>
```

## Licence

BSD 2 Clause
