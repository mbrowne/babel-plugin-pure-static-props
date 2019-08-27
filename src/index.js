import syntax from 'babel-plugin-syntax-jsx'
import annotateAsPure from '@babel/helper-annotate-as-pure'
import isStatelessComponent from './isStatelessComponent'
import isReactClass from './isReactClass'

export default function({ types: t }) {
    const classComponentPaths = new Set()
    let staticPropertiesToSet = []

    return {
        inherits: syntax,
        visitor: {
            Program(programPath) {
                // On program start, do an explicit traversal up front for this plugin
                programPath.traverse({
                    // Get a list of React classes with static properties before they're transpiled
                    ClassDeclaration(path) {
                        if (
                            isReactClass(path.get('superClass'), path.scope, {})
                        ) {
                            classComponentPaths.add(path)
                        }
                    },
                })
            },

            AssignmentExpression(path) {
                if (
                    !path.get('left').isMemberExpression() ||
                    path.node.operator !== '='
                ) {
                    return
                }
                const { node, scope } = path
                const memberExpression = node.left
                const componentNameIdentifier = memberExpression.object
                const componentName = componentNameIdentifier.name
                const binding = scope.getBinding(componentName)
                if (!binding) {
                    return
                }
                const staticPropKey = memberExpression.property
                const staticPropValue = node.right

                if (
                    isStatelessComponent(binding.path) ||
                    classComponentPaths.has(binding.path)
                ) {
                    // this will be passed as part of the second argument to Object.assign()
                    staticPropertiesToSet.push(
                        t.ObjectProperty(staticPropKey, staticPropValue)
                    )
                    // check to see if the next statement is also a static property so we can group them together in a single
                    // Object.assign() call in that case
                    if (
                        isNextStatementAlsoStaticPropertyAssignment(
                            path,
                            componentName
                        )
                    ) {
                        path.getStatementParent().remove()
                    } else {
                        // If we've reached here, it's time to inject the Object.assign() statement.
                        //
                        // Just annotating the existing code with the /*#__PURE__*/ comment isn't enough...
                        // the /*#__PURE__*/ annotation apparently only works for function calls. So we use Object.assign()
                        // and add the annotation to that.
                        const objectAssignCall = t.CallExpression(
                            t.MemberExpression(
                                t.Identifier('Object'),
                                t.Identifier('assign')
                            ),
                            [
                                componentNameIdentifier,
                                t.ObjectExpression(staticPropertiesToSet),
                            ]
                        )
                        path.replaceWith(objectAssignCall)
                        annotateAsPure(objectAssignCall)

                        staticPropertiesToSet = []
                    }
                }
            },
        },
    }
}

function isNextStatementAlsoStaticPropertyAssignment(
    assignmentExprPath,
    componentName
) {
    // the parent of the AssignmentExpression should be an ExpressionStatement
    const parentPath = assignmentExprPath.getStatementParent()
    const nextStatementPath = parentPath.getSibling(parentPath.key + 1)
    if (!nextStatementPath.isExpressionStatement()) {
        return false
    }
    const nextExpressionPath = nextStatementPath.get('expression')
    if (
        !(
            nextExpressionPath.isAssignmentExpression() &&
            nextExpressionPath.get('left').isMemberExpression()
        )
    ) {
        return false
    }
    const identifier = nextExpressionPath.get('left.object')
    return identifier.isIdentifier() && identifier.node.name === componentName
}
