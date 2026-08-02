import * as React from "react";

function IconAttachment(props) {
    return (
        <svg
            fill="none"
            viewBox="0 0 15 15"
            height={props.height || "1.2em"}
            width={props.width || "1.2em"}
            color={props.color || "orange"}
            {...props}
        >
            <path
                stroke="currentColor"
                d="M.5 0v4.5a2 2 0 104 0v-3a1 1 0 00-2 0V5M6 .5h6.5a1 1 0 011 1v12a1 1 0 01-1 1h-10a1 1 0 01-1-1V8M11 4.5H7m4 3H7m4 3H4"
            />
        </svg>
    );
}

export default IconAttachment;
