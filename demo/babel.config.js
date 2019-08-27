module.exports = {
    presets: [['@babel/preset-env', { targets: { chrome: 76 } }]],
    // presets: ['@babel/preset-env'],
    plugins: [
        // NB: If you're using plugin-proposal-class-properties to transpile `static displayName = ...`, etc.,
        // this plugin only supports transpilation using `loose: true`. It would be possible to support the newer
        // (spec-compliant) mode as well, but class components are falling out of favor anyway...
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        require('../lib'),
    ],
}
