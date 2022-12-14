import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import { SectionPage } from '../pages/SectionPage';
import { FilePage } from '../components/FilePage';
import { getSectionsWithFiles } from '../services';
import { PARAMETER_NAME } from '../constants';
import { SectionWithFiles } from '../types';

export const SectionRouter = () => {
  const { section, '*': sections = '' } = useParams();
  const { hash } = useLocation();

  const path = `${section}/${sections}`.replace(/\/+$/, '');

  const [sectionsWithFiles, setSectionWithFiles] = useState(
    [] as SectionWithFiles[]
  );

  useEffect(() => {
    getSectionsWithFiles(path).then((result) => setSectionWithFiles(result));
  }, [path]);

  const [searchParams] = useSearchParams();

  const isFullScreen = searchParams.get(PARAMETER_NAME) !== null;

  return isFullScreen ? (
    <FilePage sectionsWithFiles={sectionsWithFiles} />
  ) : (
    <SectionPage
      sectionsWithFiles={sectionsWithFiles}
      path={path}
      hash={hash}
    />
  );
};
