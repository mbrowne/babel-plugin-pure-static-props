import React from 'react'

// export function FunctionComponent() {
//     return React.createElement('div')
// }
// FunctionComponent.displayName = 'Foo'
// FunctionComponent.defaultProps = {}

export class ClassComponent extends React.Component {
    static displayName = 'Bar'
    static defaultProps = {}

    render() {
        return null
    }
}
