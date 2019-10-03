# babel-plugin-pure-static-props

## DEPRECATED

This plugin is deprecated in favor of https://github.com/styled-components/babel-plugin-styled-components/pull/248.
It's possible that something other than styled-components might cause a similar issue, in which case this plugin might still be useful, but I won't be maintaining it. (Also, my implementation for babel-plugin-styled-components is a bit more efficient than what I did here.)

---

Fixes an issue with tree shaking that can occur when using static properties on React components using styled-components.

This plugin replaces static property assignments on React components (e.g. `MyComponent.defaultProps = {...}`) with `Object.assign()` statements annotated with `/*#__PURE__*/` comments so that tree-shaking will work correctly.
