import React, { useEffect } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import { AlbumPage } from '../pages/AlbumPage';
import { HomePage } from '../pages/HomePage';
import { getAlbumsWithFilesToShow } from '../services/getAlbumsWithFilesToShow';
import { AdminChanges } from '../components/AdminChanges';
import { ShowMode } from '../components/ShowMode';
import { AdminLogin } from '../components/AdminLogin';
import { Navigation } from '../components/Navigation';
import { parseUrl } from '../services/utils';
import {
  apiLoad,
  selectAllAlbums,
  selectAllFiles,
  selectIsApiLoading,
  selectShouldLoad,
  setCurrentMainPath,
  setIsShowingByDate,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ScrollTo } from '../components/ScrollTo';

export const MainRouter = () => {
  const dispatch = useAppDispatch();

  const isApiLoading = useAppSelector(selectIsApiLoading);
  const allAlbums = useAppSelector(selectAllAlbums);
  const allFiles = useAppSelector(selectAllFiles);
  const shouldLoad = useAppSelector(selectShouldLoad);

  const { path, dateRanges, scrolledToFile, scrolledToAlbum } = parseUrl(
    useParams(),
    useSearchParams()[0],
    useLocation()
  );

  useEffect(() => {
    (async () => {
      dispatch(setCurrentMainPath(path));
      dispatch(setIsShowingByDate(Boolean(dateRanges)));

      if (shouldLoad) {
        await dispatch(apiLoad(false));
      }
    })();
  }, [path, dateRanges, dispatch, shouldLoad]);

  const albumsWithFilesToShow = getAlbumsWithFilesToShow({
    allAlbums,
    allFiles,
    path,
    dateRanges,
  });

  const isHomePathAndAlbumsShowing = !dateRanges && path === '/';

  return (
    <>
      {isApiLoading && (
        <main style={{ padding: '0.5rem' }}>⏳ Loading... Please wait</main>
      )}

      {!isApiLoading && (
        <>
          <AdminChanges />
          <AdminLogin />

          {albumsWithFilesToShow.length > 0 && (
            <>
              <div style={{ textAlign: 'center' }}>
                <ShowMode dateRanges={dateRanges} />
              </div>

              {isHomePathAndAlbumsShowing ? (
                <HomePage
                  albums={albumsWithFilesToShow.map(
                    (albumWithFiles) => albumWithFiles.album
                  )}
                />
              ) : (
                <AlbumPage
                  albumsWithFiles={albumsWithFilesToShow}
                  path={path}
                  isHiddenHashLink={Boolean(dateRanges)}
                  currentFile={scrolledToFile}
                />
              )}

              <ScrollTo
                path={path}
                scrolledToAlbum={scrolledToAlbum}
                scrolledToFile={scrolledToFile}
              />
            </>
          )}

          {albumsWithFilesToShow.length === 0 && (
            <>
              <Navigation path="home" />
              <main style={{ padding: '1rem' }}>
                No albums or photos are available (or you don't have access to
                them). Please try logging in or adjusting the album path (or
                dates)."
              </main>
            </>
          )}
        </>
      )}
    </>
  );
};
