import { useEffect, useMemo, useState } from 'react';
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
  selectLoadedRequests,
  setShowingProperties,
  selectUser,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { ScrollTo } from '../components/ScrollTo';
import { Spinner } from '../components/Spinner';

const CATEGORIES_TO_HIDE = ['gigs-posters', 'gigs', 'board-games'];
const CATEGORIES_HIDDEN_BY_DEFAULT_EMAILS = ['zinovikos@gmail.com'];

export const MainRouter = () => {
  const dispatch = useAppDispatch();

  const {
    currentPath,
    dateRanges,
    tags,
    scrolledToFile,
    scrolledToAlbum,
    token,
  } = parseUrl(useParams(), useSearchParams()[0], useLocation());

  useEffect(() => {
    dispatch(
      setShowingProperties({
        currentPath,
        dateRanges,
        tags,
        token,
      }),
    );
  }, [currentPath, dateRanges, tags, token, dispatch]);

  const loadedRequests = useAppSelector(selectLoadedRequests);
  const isApiLoading = useAppSelector(selectIsApiLoading);

  const shouldLoad = useMemo(
    () => getShouldLoad(loadedRequests, currentPath, dateRanges, tags),
    [loadedRequests, currentPath, dateRanges, tags],
  );

  useEffect(() => {
    if (shouldLoad && !isApiLoading) {
      dispatch(apiLoad(false));
    }
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
    [allAlbums, allFiles, changes],
  );
  const albumsWithFilesToShow = useMemo(
    () =>
      getAlbumsWithFilesToShow({
        allAlbums: albums,
        allFiles: files,
        currentPath,
        dateRanges,
        tags,
      }),
    [albums, files, currentPath, dateRanges, tags],
  );

  const isApiLogining = useAppSelector(selectIsApiLogining);

  const [hiddenCategories, setHiddenCategories] = useState<
    string[] | undefined
  >(undefined);
  const user = useAppSelector(selectUser);
  if (hiddenCategories === undefined && user?.email !== undefined) {
    setHiddenCategories(
      CATEGORIES_HIDDEN_BY_DEFAULT_EMAILS.includes(user?.email)
        ? CATEGORIES_TO_HIDE
        : [],
    );
  }
  const albumsWithFilesToShowFiltered =
    hiddenCategories !== undefined && hiddenCategories?.length > 0
      ? albumsWithFilesToShow.filter(
          (albumWithFiles) =>
            !hiddenCategories.some(
              (path) =>
                albumWithFiles.album.path === path ||
                albumWithFiles.album.path.startsWith(`${path}/`),
            ),
        )
      : albumsWithFilesToShow;

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

      {!isApiLogining && hiddenCategories && (
        <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
          <span>Hide:</span>
          {CATEGORIES_TO_HIDE.map((category) => (
            <label style={{ paddingLeft: '0.3rem' }} key={category}>
              <input
                type="checkbox"
                checked={hiddenCategories.includes(category)}
                onChange={() =>
                  setHiddenCategories(
                    hiddenCategories.includes(category)
                      ? hiddenCategories.filter((c) => c !== category)
                      : [...hiddenCategories, category],
                  )
                }
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      )}

      {(isApiLoading || isApiLogining) && <Spinner />}

      {!isApiLoading && !shouldLoad && (
        <>
          {albumsWithFilesToShowFiltered.length > 0 && (
            <>
              {!dateRanges && currentPath === '' ? (
                <HomePage
                  albums={albumsWithFilesToShowFiltered.map(
                    (albumWithFiles) => albumWithFiles.album,
                  )}
                />
              ) : (
                <>
                  <AlbumPage
                    albumsWithFiles={albumsWithFilesToShowFiltered}
                    currentPath={currentPath}
                    dateRanges={dateRanges}
                    tags={tags}
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

          {albumsWithFilesToShowFiltered.length === 0 && (
            <>
              <Navigation />
              <main style={{ padding: '1rem' }}>
                No albums or photos are available (or you don't have access to
                them). Please try logging in or adjusting the album path (or
                dates/tags).
              </main>
            </>
          )}
        </>
      )}
    </>
  );
};
