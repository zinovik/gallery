import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SectionPage } from './SectionPage';
import { ImagePage } from './ImagePage';
import { getSectionsWithImages } from '../services';
import { SectionWithImages } from '../types';

export const SectionRouter = () => {
  const { section, '*': sections = '' } = useParams();

  const path = useMemo(
    () => `${section}/${sections}`.replace(/\/+$/, ''),
    [section, sections]
  );

  const [sectionsWithImages, setSectionWithImages] = useState(
    [] as SectionWithImages[]
  );

  useEffect(() => {
    getSectionsWithImages(path).then((result) => setSectionWithImages(result));
  }, [path]);

  const [searchParams] = useSearchParams();

  const isFullScreen = searchParams.get('image') !== null;

  return isFullScreen ? (
    <ImagePage sectionsWithImages={sectionsWithImages} />
  ) : (
    <SectionPage sectionsWithImages={sectionsWithImages} path={path} />
  );
};
