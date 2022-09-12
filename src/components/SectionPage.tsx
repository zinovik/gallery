import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Section } from './Section';
import { getLinks } from '../services/helper';
import { AgendaInterface, SectionWithFiles } from '../types';

interface Props {
  sectionsWithFiles: SectionWithFiles[];
  path: string;
}

export const SectionPage = ({ sectionsWithFiles, path }: Props) => {
  const links = getLinks(path);

  useEffect(() => window.scrollTo(0, 0), []);

  const agenda: AgendaInterface[] = sectionsWithFiles
    .slice(1)
    .map((sectionWithFiles) => ({
      level: sectionWithFiles.level,
      title: sectionWithFiles.section.title,
      path: sectionWithFiles.section.path,
    }));

  return (
    <>
      <nav style={{ textAlign: 'right', paddingTop: '1rem' }}>
        <Link to="/">home</Link>
        {links.map((link) => (
          <span key={link.url}>
            {' / '}
            <Link to={link.url}>{link.text}</Link>
          </span>
        ))}
      </nav>

      <main>
        {sectionsWithFiles.length === 0 && <>⏳ Loading...</>}

        {sectionsWithFiles.map((sectionWithFiles) => (
          <Section
            sectionWithFiles={sectionWithFiles}
            path={path}
            agenda={agenda}
            key={sectionWithFiles.section.path}
          />
        ))}
      </main>
    </>
  );
};
