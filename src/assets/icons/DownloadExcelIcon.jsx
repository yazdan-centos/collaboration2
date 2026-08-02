import React from 'react';
import styled from 'styled-components';
import { SiMicrosoftexcel } from 'react-icons/si';

const ExcelIcon = styled(SiMicrosoftexcel)`
    color: #72a355;
    cursor: pointer;
    margin: 1rem 1rem;
    transition: color 0.3s, filter 0.3s;

    &:hover {
        color: #90ee90;
        filter: brightness(1.2);
    }
`;

const DownloadExcelIcon = ({ downloadExcelFile }) => {
    return (
        <ExcelIcon
            onClick={downloadExcelFile}
            size={"2rem"}
            type="button"
        />
    );
};

export default DownloadExcelIcon;
