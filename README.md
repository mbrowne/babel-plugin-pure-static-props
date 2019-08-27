# babel-plugin-pure-static-props

Fixes an issue with tree shaking that can occur when using static properties on React components using styled-components.

This plugin replaces static property assignments on React components (e.g. `MyComponent.defaultProps = {...}`) with `Object.assign()` statements annotated with `/*#__PURE__*/` comments so that tree-shaking will work correctly.
