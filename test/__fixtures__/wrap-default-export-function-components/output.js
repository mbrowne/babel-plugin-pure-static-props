import React from 'react'

const FunctionComponent =
    /*#__PURE__*/
    (() => {
        function FunctionComponent() {
            return <div>My Component</div>
        }

        FunctionComponent.displayName = 'FancyName1'
        FunctionComponent.defaultProps = {}
        return FunctionComponent
    })()

export default FunctionComponent
