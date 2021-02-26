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
export const MyComponent =
    /*#__PURE__*/
    (() => {
        var _class

        _class = class MyComponent extends React.PureComponent {
            render() {
                return <div>My Component</div>
            }
        }

        _defineProperty(_class, 'displayName', 'FancyName1')
    })()
