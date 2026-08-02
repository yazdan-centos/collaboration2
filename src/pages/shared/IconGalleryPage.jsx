import React from 'react';
import IconAccountDetailsOutline from '../../assets/icons/IconAccountDetailsOutline';
import IconAddCircleLine from '../../assets/icons/IconAddCircleLine';
import IconAttach from '../../assets/icons/IconAttach';
import IconAttachment from '../../assets/icons/IconAttachment';
import IconBxRefresh from '../../assets/icons/IconBxRefresh';
import IconDeleteOutline from '../../assets/icons/IconDeleteOutline';
import IconEdit from '../../assets/icons/IconEdit';
import IconFile from '../../assets/icons/IconFile';
import IconFileEarmarkPpt from '../../assets/icons/IconFileEarmarkPpt';
import IconFileJpg from '../../assets/icons/IconFileJpg';
import IconFilePdf from '../../assets/icons/IconFilePdf';
import IconFiletypeCsv from '../../assets/icons/IconFiletypeCsv';
import IconFiletypePng from '../../assets/icons/IconFiletypePng';
import IconKey from '../../assets/icons/IconKey';
import IconMicrosoftExcel from '../../assets/icons/IconMicrosoftExcel';
import IconMicrosoftword from '../../assets/icons/IconMicrosoftword';
import IconPoweroff from '../../assets/icons/IconPoweroff';
import GenerateDescIcon from '../../assets/icons/GenerateDescIcon';
import IconFileZip from '../../assets/icons/IconFileZip';
import pencilSquare from '../../assets/icons/pencil-square.svg';

const icons = [
  ['IconAccountDetailsOutline', IconAccountDetailsOutline], ['IconAddCircleLine', IconAddCircleLine],
  ['IconAttach', IconAttach], ['IconAttachment', IconAttachment], ['IconBxRefresh', IconBxRefresh],
  ['IconDeleteOutline', IconDeleteOutline], ['IconEdit', IconEdit], ['IconFile', IconFile],
  ['IconFileEarmarkPpt', IconFileEarmarkPpt], ['IconFileJpg', IconFileJpg], ['IconFilePdf', IconFilePdf],
  ['IconFiletypeCsv', IconFiletypeCsv], ['IconFiletypePng', IconFiletypePng], ['IconKey', IconKey],
  ['IconMicrosoftExcel', IconMicrosoftExcel], ['IconMicrosoftword', IconMicrosoftword],
  ['IconPoweroff', IconPoweroff], ['GenerateDescIcon', GenerateDescIcon], ['IconFileZip', IconFileZip],
  ['pencil-square.svg', pencilSquare],
];

export default function IconGalleryPage() {
  return (
    <section className="icon-gallery-page" dir="ltr">
      <header className="icon-gallery-header">
        <div>
          <span className="page-eyebrow">Design system</span>
          <h1>Icon gallery</h1>
          <p>All reusable icons available in <code>src/assets/icons</code>.</p>
        </div>
        <span className="icon-gallery-count">{icons.length} icons</span>
      </header>
      <div className="icon-gallery-grid">
        {icons.map(([name, Icon]) => (
          <article className="icon-gallery-card" key={name}>
            <div className="icon-gallery-preview">
              {typeof Icon === 'string' ? <img src={Icon} alt="" /> : <Icon aria-hidden="true" />}
            </div>
            <div className="icon-gallery-name" title={name}>{name}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
