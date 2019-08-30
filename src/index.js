import template from '@babel/template'
import syntax from 'babel-plugin-syntax-jsx'
import annotateAsPure from '@babel/helper-annotate-as-pure'
import isStatelessComponent from './isStatelessComponent'
import isReactClass from './isReactClass'

const buildIife = template('(() => {\nBODY;\n})();')

export default function({ types: t }) {
    // map of React function components to their static properties
    const functionComponentStaticProperties = new Map()

    return {
        inherits: syntax,
        visitor: {
            Program: {
                enter(programPath) {
                    // On program start, do an explicit traversal up front for this plugin
                    programPath.traverse({
                        ClassDeclaration: {
                            exit(path) {
                                if (
                                    isReactClass(
                                        path.get('superClass'),
                                        path.scope,
                                        {}
                                    )
                                ) {
                                    const hasStaticProperties = path
                                        .get('body.body')
                                        .some(
                                            classElementPath =>
                                                classElementPath.isClassProperty() &&
                                                classElementPath.node.static
                                        )
                                    if (hasStaticProperties) {
                                        const componentNameIdentifier =
                                            path.node.id
                                        path.node.type = 'ClassExpression'
                                        const iife = buildIife({
                                            BODY: path.node,
                                        })
                                        annotateAsPure(iife.expression)
                                        path.replaceWith(
                                            t.VariableDeclaration('const', [
                                                t.VariableDeclarator(
                                                    componentNameIdentifier,
                                                    iife.expression
                                                ),
                                            ])
                                        )
                                    }
                                }
                            },
                        },
                    })
                },
                exit() {
                    // After the full program has been traversed, we now have a map of which functions are React
                    // components that have static properties. So we can now replace each function declaration
                    // with with an IIFE and put the static property assignments inside the IIFE.
                    functionComponentStaticProperties.forEach(
                        (staticProperties, functionComponentPath) => {
                            const componentNameIdentifier =
                                functionComponentPath.node.id

                            // get or construct the function node to put inside the IIFE depending on whether or not
                            // it's an arrow function
                            const functionNode = functionComponentPath.isVariableDeclarator()
                                ? t.VariableDeclaration('const', [
                                      functionComponentPath.node,
                                  ])
                                : functionComponentPath.node

                            const componentAndStaticProperties = [
                                functionNode,
                                ...staticProperties,
                                t.ReturnStatement(componentNameIdentifier),
                            ]
                            const iife = buildIife({
                                BODY: componentAndStaticProperties,
                            })
                            annotateAsPure(iife.expression)

                            functionComponentPath
                                .getStatementParent()
                                .replaceWith(
                                    t.VariableDeclaration('const', [
                                        t.VariableDeclarator(
                                            componentNameIdentifier,
                                            iife.expression
                                        ),
                                    ])
                                )
                        }
                    )
                },
            },

            AssignmentExpression(path, state) {
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

                if (isStatelessComponent(binding.path)) {
                    // add this static property to our map of static properties for this component
                    const funcPath = binding.path
                    const staticProperties =
                        functionComponentStaticProperties.get(funcPath) || []
                    staticProperties.push(path.parent)
                    functionComponentStaticProperties.set(
                        funcPath,
                        staticProperties
                    )
                    // remove the static property assignment; we'll re-add it inside the IIFE at the end
                    path.remove()
                }
            },
        },
    }
}
