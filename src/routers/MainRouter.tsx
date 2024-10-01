import React, { useEffect, useState, useReducer, createContext } from 'react';
import {
  useParams,
  useSearchParams,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { AlbumPage } from '../pages/AlbumPage';
import { HomePage } from '../pages/HomePage';
import { getFilteredAlbumsWithFiles } from '../services';
import { PARAMETER_DATE_RANGES, PARAMETER_FILE } from '../constants';
import { AlbumWithFiles } from '../types';
import { AdminUpdated } from '../components/AdminUpdated';
import { ShowMode } from '../components/ShowMode';
import { AdminLogin } from '../components/AdminLogin';
import { Link } from 'react-router-dom';

export const ForceUpdateContext = createContext(() => null as any);

export const MainRouter = () => {
  const [updateKey, forceUpdate] = useReducer((x) => x + 1, 0);

  const [isLoading, setIsLoading] = useState(true);

  const [isHomePathAndAlbumsShowing, setIsHomePathAndAlbumsShowing] = useState(
    false as boolean | undefined
  );

  const [dateRanges, setDateRanges] = useState(
    undefined as string[][] | undefined
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const dateRangesParameter = searchParams.get(PARAMETER_DATE_RANGES);
  const scrolledToFile = searchParams.get(PARAMETER_FILE) ?? '';

  const { hash } = useLocation();
  const scrolledToAlbum = hash.substring(1);

  const { '*': route = '' } = useParams();
  const path = `${route}`.replace(/\/+$/, '');

  const [previousRoute, setPreviousRoute] = useState(route);

  const [albumsWithFiles, setAlbumWithFiles] = useState([] as AlbumWithFiles[]);

  const navigate = useNavigate();

  useEffect(() => {
    const dateRanges = dateRangesParameter
      ?.split(',')
      .map((dateRange) => dateRange.split('-'));

    setDateRanges(dateRanges);
    setIsLoading(true);

    getFilteredAlbumsWithFiles({ path, dateRanges }).then(
      ({ albumsWithFiles, isHomePathAndAlbumsShowing }) => {
        setIsLoading(false);
        setAlbumWithFiles(albumsWithFiles);
        setIsHomePathAndAlbumsShowing(isHomePathAndAlbumsShowing);
      }
    );
  }, [path, dateRangesParameter, updateKey, navigate]);

  useEffect(() => {
    if (albumsWithFiles.length === 0) return;

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
  }, [
    albumsWithFiles,
    scrolledToAlbum,
    scrolledToFile,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (route !== previousRoute) {
      setPreviousRoute(route);
      if (!scrolledToFile && !scrolledToAlbum) window.scrollTo(0, 0);
    }
  }, [scrolledToFile, scrolledToAlbum, route, previousRoute, setPreviousRoute]);

  return (
    <ForceUpdateContext.Provider value={() => forceUpdate()}>
      {isLoading ? (
        <main>⏳ Loading...</main>
      ) : albumsWithFiles.length > 0 ? (
        <>
          <AdminUpdated />
          <AdminLogin />

          <div style={{ textAlign: 'center' }}>
            <ShowMode dateRanges={dateRanges} />
          </div>

          {isHomePathAndAlbumsShowing ? (
            <HomePage albumsWithFiles={albumsWithFiles} />
          ) : (
            <AlbumPage
              albumsWithFiles={albumsWithFiles}
              path={path}
              dateRanges={dateRanges}
              currentFile={scrolledToFile}
            />
          )}
        </>
      ) : (
        <>
          <AdminLogin />
          <nav style={{ textAlign: 'right', paddingTop: '1rem' }}>
            <Link to={'/'}>home</Link>
          </nav>
          <main style={{ padding: '1rem' }}>
            No albums or photos are available (or you don't have access to
            them). Please try logging in or adjusting the album path (or
            dates)."
          </main>
        </>
      )}
    </ForceUpdateContext.Provider>
  );
};
