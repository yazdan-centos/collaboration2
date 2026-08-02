// icon:add-circle-line | Remix Icon https://remixicon.com/ | Remix Design
import * as React from "react";

function IconAddCircleLine(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            height="1em"
            width="1em"
            fontSize={props.fontSize}
            color="blue"
            onClick={props.onClick}
            cursor={"pointer"}
        >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M11 11V7h2v4h4v2h-4v4h-2v-4H7v-2h4zm1 11C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
    );
}

export default IconAddCircleLine;
