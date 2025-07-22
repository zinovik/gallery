import React, { useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import { AlbumPage } from '../pages/AlbumPage';
import { HomePage } from '../pages/HomePage';
import { applyChanges } from '../services/applyChanges';
import { getAlbumsWithFilesToShow } from '../services/getAlbumsWithFilesToShow';
import { AdminChanges } from '../components/AdminChanges';
import { ShowMode } from '../components/ShowMode';
import { AdminLogin } from '../components/AdminLogin';
import { Navigation } from '../components/Navigation';
import { parseUrl, getShouldLoad } from '../services/utils';
import {
  apiLoad,
  selectAllAlbums,
  selectAllFiles,
  selectChanges,
  selectIsApiLoading,
  selectIsApiLogining,
  selectLoadedPaths,
  setShowingProperties,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ScrollTo } from '../components/ScrollTo';

export const MainRouter = () => {
  const dispatch = useAppDispatch();

  const { currentPath, dateRanges, scrolledToFile, scrolledToAlbum, token } =
    parseUrl(useParams(), useSearchParams()[0], useLocation());

  useEffect(() => {
    dispatch(
      setShowingProperties({
        currentPath,
        dateRanges,
        token,
      })
    );
  }, [currentPath, dateRanges, token, dispatch]);

  const loadedPaths = useAppSelector(selectLoadedPaths);
  const isApiLoading = useAppSelector(selectIsApiLoading);

  const shouldLoad = useMemo(
    () => getShouldLoad(loadedPaths, currentPath, dateRanges),
    [loadedPaths, currentPath, dateRanges]
  );

  useEffect(() => {
    (async () => {
      if (shouldLoad && !isApiLoading) {
        await dispatch(apiLoad(false));
      }
    })();
  }, [shouldLoad, isApiLoading, dispatch]);

  const allAlbums = useAppSelector(selectAllAlbums);
  const allFiles = useAppSelector(selectAllFiles);
  const changes = useAppSelector(selectChanges);

  const { albums, files } = useMemo(
    () =>
      applyChanges({
        allAlbums,
        allFiles,
        changes,
      }),
    [allAlbums, allFiles, changes]
  );
  const albumsWithFilesToShow = useMemo(
    () =>
      getAlbumsWithFilesToShow({
        allAlbums: albums,
        allFiles: files,
        currentPath,
        dateRanges,
      }),
    [albums, files, currentPath, dateRanges]
  );

  const isApiLogining = useAppSelector(selectIsApiLogining);

  return (
    <>
      <AdminChanges />

      {!isApiLogining && (
        <>
          <AdminLogin />
          <div style={{ textAlign: 'center' }}>
            <ShowMode dateRanges={dateRanges} currentPath={currentPath} />
          </div>
        </>
      )}

      {(isApiLoading || isApiLogining || shouldLoad) && (
        <main style={{ padding: '0.5rem' }}>⏳ Loading... Please wait</main>
      )}

      {!isApiLoading && !shouldLoad && (
        <>
          {albumsWithFilesToShow.length > 0 && (
            <>
              {!dateRanges && currentPath === '' ? (
                <HomePage
                  albums={albumsWithFilesToShow.map(
                    (albumWithFiles) => albumWithFiles.album
                  )}
                />
              ) : (
                <>
                  <AlbumPage
                    albumsWithFiles={albumsWithFilesToShow}
                    currentPath={currentPath}
                    isShowingByDate={Boolean(dateRanges)}
                    currentFile={scrolledToFile}
                  />

                  <ScrollTo
                    currentPath={currentPath}
                    scrolledToAlbum={scrolledToAlbum}
                    scrolledToFile={scrolledToFile}
                  />
                </>
              )}
            </>
          )}

          {albumsWithFilesToShow.length === 0 && (
            <>
              <Navigation />
              <main style={{ padding: '1rem' }}>
                No albums or photos are available (or you don't have access to
                them). Please try logging in or adjusting the album path (or
                dates).
              </main>
            </>
          )}
        </>
      )}
    </>
  );
};
