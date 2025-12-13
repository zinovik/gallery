import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Props {
  currentPath: string;
  scrolledToFile: string;
  scrolledToAlbum: string;
}

export const ScrollTo = ({
  currentPath,
  scrolledToFile,
  scrolledToAlbum,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [previousPath, setPreviousPath] = useState(currentPath);

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
    if (currentPath !== previousPath) {
      setPreviousPath(currentPath);
      if (!scrolledToFile && !scrolledToAlbum) window.scrollTo(0, 0);
    }
  }, [
    scrolledToFile,
    scrolledToAlbum,
    currentPath,
    previousPath,
    setPreviousPath,
  ]);

  return <></>;
};
