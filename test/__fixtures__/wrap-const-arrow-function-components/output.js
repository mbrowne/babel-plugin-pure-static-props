import React from 'react'

const FunctionComponent =
    /*#__PURE__*/
    (function () {
        const FunctionComponent = () => {
            return <div>My Component</div>
        }

        FunctionComponent.displayName = 'FancyName1'
        FunctionComponent.defaultProps = {}
        return FunctionComponent
    })()

export { FunctionComponent }
