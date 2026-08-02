import React from 'react';
import IconFileJpg from "./IconFileJpg";
import IconFilePdf from "./IconFilePdf";
import IconFiletypePng from "./IconFiletypePng";
import IconMicrosoftword from "./IconMicrosoftword";
import IconMicrosoftExcel from "./IconMicrosoftExcel";
import IconFileZip from "./IconFileZip";
import IconFileEarmarkPpt from "./IconFileEarmarkPpt";
import IconFile from "./IconFile";
import IconFiletypeCsv from "./IconFiletypeCsv";

const FileTypeIcon = ({fileExtension,height="2em",width="2em"}) => {
    return (
        <>
            {fileExtension === 'jpg' && <IconFileJpg height={height} width={width} />}
            {fileExtension === 'pdf' && <IconFilePdf height={height} width={width} />}
            {fileExtension === 'png' && <IconFiletypePng  height={height} width={width} />}
            {fileExtension === 'doc' && <IconMicrosoftword height={height} width={width} />}
            {fileExtension === 'docx' && <IconMicrosoftword  height={height} width={width} />}
            {fileExtension === 'xls' && <IconMicrosoftExcel height={height} width={width} />}
            {fileExtension === 'xlsx' && <IconMicrosoftExcel height={height} width={width} />}
            {fileExtension === 'ppt' && <IconFileEarmarkPpt height={height} width={width} />}
            {fileExtension === 'pptx' && <IconFileEarmarkPpt height={height} width={width} />}
            {fileExtension === 'txt' && <IconFile height={height} width={width} />}
            {fileExtension === 'csv' && <IconFiletypeCsv height={height} width={width} />}
            {fileExtension === 'zip' && <IconFileZip height={height} width={width} />}
            {fileExtension === 'rar' && <IconFileZip height={height} width={width} />}
        </>
    );
};

export default FileTypeIcon;