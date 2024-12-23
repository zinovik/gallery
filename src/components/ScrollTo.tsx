import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Props {
  path: string;
  scrolledToFile: string;
  scrolledToAlbum: string;
}

export const ScrollTo = ({ path, scrolledToFile, scrolledToAlbum }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [previousPath, setPreviousPath] = useState(path);

  useEffect(() => {
    const removeFileParam = (event: Event) => {
      searchParams.delete('file');
      setSearchParams(searchParams);
      event.stopPropagation();
      window.removeEventListener('wheel', removeFileParam);
      window.removeEventListener('touchmove', removeFileParam);
    };

    const scrolledTo = scrolledToFile || scrolledToAlbum;

    if (scrolledTo) {
      setTimeout(() => {
        const element = document.getElementById(scrolledTo);
        if (!element) return;

        window.removeEventListener('wheel', removeFileParam);
        window.removeEventListener('touchmove', removeFileParam);

        element.scrollIntoView({
          block: scrolledToFile ? 'center' : 'nearest',
        });
        if (scrolledToFile) {
          window.addEventListener('wheel', removeFileParam);
          window.addEventListener('touchmove', removeFileParam);
        }
      }, 800); // delay after page loading to scroll to the right place ¯\_(ツ)_/¯
    }

    if (!scrolledToFile) {
      window.removeEventListener('wheel', removeFileParam);
      window.removeEventListener('touchmove', removeFileParam);
    }

    return () => {
      window.removeEventListener('wheel', removeFileParam);
      window.removeEventListener('touchmove', removeFileParam);
    };
  }, [scrolledToAlbum, scrolledToFile, searchParams, setSearchParams]);

  useEffect(() => {
    if (path !== previousPath) {
      setPreviousPath(path);
      if (!scrolledToFile && !scrolledToAlbum) window.scrollTo(0, 0);
    }
  }, [scrolledToFile, scrolledToAlbum, path, previousPath, setPreviousPath]);

  return <></>;
};
