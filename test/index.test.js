import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '../src'

pluginTester({
    plugin,
    pluginName: 'babel-plugin-pure-static-props',
    babelOptions: {
        plugins: [
            '@babel/plugin-proposal-class-properties',
        ],
    },
    fixtures: path.join(__dirname, '__fixtures__'),
});
