// Copied from https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types/blob/master/src/index.js

export default function isReactClass(superClass, scope, globalOptions) {
    if (!superClass.node) {
        return false
    }

    let answer = false

    if (isPathReactClass(superClass, globalOptions)) {
        answer = true
    } else if (superClass.node.name) {
        // Check for inheritance
        const className = superClass.node.name
        const binding = scope.getBinding(className)
        if (!binding) {
            answer = false
        } else {
            const bindingSuperClass = binding.path.get('superClass')

            if (isPathReactClass(bindingSuperClass, globalOptions)) {
                answer = true
            }
        }
    }

    return answer
}

function isPathReactClass(path, globalOptions) {
    const node = path.node
    const matchers = globalOptions.classNameMatchers

    if (
        path.matchesPattern('React.Component') ||
        path.matchesPattern('React.PureComponent')
    ) {
        return true
    }

    if (node && (node.name === 'Component' || node.name === 'PureComponent')) {
        return true
    }

    if (node && matchers && matchers.test(node.name)) {
        return true
    }

    return false
}
