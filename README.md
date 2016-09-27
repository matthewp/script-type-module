# &lt;script type=module&gt; - the polyfill!

An attempt to build a polyfill for [<script type="module">](https://blog.whatwg.org/js-modules). Because [the waiting](https://www.youtube.com/watch?v=uMyCa35_mOg) is the hardest part.

This polyfill includes:

* All `import` and `export` forms.
* Import bindings compliant with the spec; meaning a dependency can update its exported value and your module binding will reflect that change.
* A web worker architecture that allows for spawning multiple workers for faster load times (experimental).
* Full source maps.

This is alpha-ish software that is tested, but not used for any real projects (yet). Check out the [tests/](https://github.com/matthewp/script-type-module/tree/master/test) folder to see what's been worked on, submit any issues you encounter.

## Install

```
npm install script-type-module
```

## Use

```html
<script src="./node_modules/script-type-module/polyfill.js"></script>

<script type="module" src="./foo.js"></script>
```

## FAQ

**Why use this instead of a bundler?**

Bundlers are not great for development workflows. Being able to create new `.html` pages to test out small parts of your application without creating a new build just for that, is a super powerful thing.

**Should I use this in production?**

No! This is primarily meant for better development workflows. Do a real build for production.

**How does this compare to es-module-loader?**

es-module-loader is a polyfill for the in progress [whatwg/loader](https://github.com/whatwg/loader) spec. This spec has been through several revisions going back many years and isn't likely to appear in browsers soon.

This polyfill is based on the already specified `<script type="module">` that is coming to browsers soon (in Edge developer preview already). The hope is that most evergreen browsers will have support within 6 months and this will only be used for testing on older browsers.

## Licence

BSD 2 Clause
