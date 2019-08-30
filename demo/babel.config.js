module.exports = {
    presets: [['@babel/preset-env', { targets: { chrome: 71 } }]],
    // presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties', require('../lib')],
}
