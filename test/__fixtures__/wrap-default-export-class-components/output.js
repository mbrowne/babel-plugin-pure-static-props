function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true,
        })
    } else {
        obj[key] = value
    }
    return obj
}

import React from 'react'

const MyComponent =
    /*#__PURE__*/
    (() => {
        class MyComponent extends React.Component {
            render() {
                return <div>My Component</div>
            }
        }

        _defineProperty(MyComponent, 'displayName', 'FancyName1')

        return MyComponent
    })()

export default MyComponent
