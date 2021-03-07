import template from '@babel/template'
import syntax from '@babel/plugin-syntax-jsx'
import annotateAsPure from '@babel/helper-annotate-as-pure'
import isStatelessComponent from './isStatelessComponent'
import isReactClass from './isReactClass'

const buildIife = template('(function() {\nBODY;\n})();')

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
                                    ) &&
                                    path.parentPath.type !== 'BlockStatement'
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
                                        const iife = buildIife({
                                            BODY: [
                                                path.node,
                                                t.ReturnStatement(path.node.id),
                                            ],
                                        })
                                        annotateAsPure(iife.expression)
                                        const declarators = [
                                            t.VariableDeclarator(
                                                componentNameIdentifier,
                                                iife.expression
                                            ),
                                        ]
                                        if (
                                            path.parentPath.isExportDefaultDeclaration()
                                        ) {
                                            path.parentPath.insertBefore(
                                                t.VariableDeclaration(
                                                    'const',
                                                    declarators
                                                )
                                            )
                                            path.replaceWith(path.node.id)
                                        } else {
                                            path.replaceWith(
                                                t.VariableDeclaration(
                                                    'const',
                                                    declarators
                                                )
                                            )
                                        }
                                    }
                                }
                            },
                        },
                    })
                },
                exit() {
                    // After the full program has been traversed, we now have a map of which functions are React
                    // components that have static properties. So we can now replace each function declaration
                    // with an IIFE and put the static property assignments inside the IIFE.
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

                            const parentPath = functionComponentPath.getStatementParent()
                            // ensure that we keep any export declarations (as in `export function MyComponent() {...}`)
                            if (parentPath.isExportDefaultDeclaration()) {
                                parentPath.insertAfter(
                                    t.ExportDefaultDeclaration(
                                        componentNameIdentifier
                                    )
                                )
                            } else if (parentPath.isExportNamedDeclaration()) {
                                const exportDecl = t.ExportNamedDeclaration(
                                    null,
                                    [
                                        t.ExportSpecifier(
                                            componentNameIdentifier,
                                            componentNameIdentifier
                                        ),
                                    ]
                                )
                                parentPath.insertAfter(exportDecl)
                            }

                            // replace the original function node with the IIFE
                            parentPath.replaceWith(
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
