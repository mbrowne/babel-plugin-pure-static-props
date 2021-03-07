# babel-plugin-pure-static-props

Fixes an issue with tree shaking that can occur when using static properties on React components using styled-components.

This plugin replaces static property assignments on React components (e.g. `MyComponent.defaultProps = {...}`) with `Object.assign()` statements annotated with `/*#__PURE__*/` comments so that tree-shaking will work correctly.

## Install

```bash
npm i -D babel-plugin-pure-static-props
```

Or:

```bash
yarn add -D babel-plugin-pure-static-props
```

Then add the plugin to your Babel config as explained in the [Babel documentation](https://babeljs.io/docs/en/options#plugin-and-preset-options).

Example `babel.config.js`:

```js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-pure-static-props',
  ],
}
```

## Note on styled components

The tree-shaking issue with static properties on React components also affects [styled components](https://styled-components.com/). This plugin only addresses tree-shaking for regular React components; it will not work on components created using the `styled` helper.

A fix for styled components is in this PR: https://github.com/styled-components/babel-plugin-styled-components/pull/248.
