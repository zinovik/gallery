import { Album } from '../components/Album';
import type { AgendaInterface, AlbumWithFiles } from '../types';
import { Navigation } from '../components/Navigation';
import { useAppSelector } from '../app/hooks';
import { selectAllAlbums } from '../app/stateSlices/allAlbumsAndFilesSlice';
import { Title } from '../components/Title';
import { Link } from 'react-router-dom';
import { getLink } from '../services/utils';
import { useMemo } from 'react';

interface Props {
  albumsWithFiles: AlbumWithFiles[];
  currentPath: string;
  dateRanges?: string[][];
  tags?: string[];
  currentFile: string | null;
}

export const AlbumPage = ({
  albumsWithFiles,
  currentPath,
  dateRanges,
  tags,
  currentFile,
}: Props) => {
  const allAlbums = useAppSelector(selectAllAlbums);

  const albumAgenda: AgendaInterface[] = albumsWithFiles
    .slice(1)
    .map((albumWithFiles) => ({
      title:
        albumWithFiles.album.title ??
        albumWithFiles.album.resolved?.title ??
        'NOT RESOLVED',
      path: albumWithFiles.album.path,
    }));

  const currentOpenedAlbum = allAlbums.find(
    (album) => album.path === currentPath,
  );

  const filesTags = useMemo(
    () => [
      ...new Set(
        albumsWithFiles
          .flatMap((albumWithFiles) =>
            albumWithFiles.files
              .flatMap((file) => file.tags ?? [])
              .filter(Boolean),
          )
          .sort(),
      ),
    ],
    [albumsWithFiles],
  );

  return (
    <>
      {albumsWithFiles.length > 0 && (
        <Title level={4}>
          <Navigation albumPath={currentPath} />
        </Title>
      )}

      <main>
        {filesTags.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            {[...filesTags, 'all'].map((filesTag, index) => (
              <span key={filesTag}>
                {index > 0 && ' '}
                {index === filesTags.length ? (
                  !tags || tags.length === 0 ? (
                    filesTag
                  ) : (
                    <Link
                      to={getLink(
                        currentOpenedAlbum?.path ?? '',
                        dateRanges,
                        [],
                      )}
                    >
                      {filesTag}
                    </Link>
                  )
                ) : (
                  <Link
                    to={getLink(
                      currentOpenedAlbum?.path ?? '',
                      dateRanges,
                      tags?.includes(filesTag)
                        ? tags.filter((tag) => tag !== filesTag)
                        : [...(tags ?? []), filesTag],
                    )}
                  >
                    {tags?.includes(filesTag) ? `[#${filesTag}]` : `#${filesTag}`}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}

        {albumsWithFiles.map((albumWithFiles, index) => (
          <div
            id={currentPath}
            key={
              albumWithFiles.album.path +
              '-' +
              albumWithFiles.files.map((file) => file.filename).join(',')
            }
          >
            <Album
              albumWithFiles={albumWithFiles}
              currentPath={currentPath}
              albumAgenda={albumAgenda}
              currentFile={currentFile}
              isShowingByDate={Boolean(dateRanges)}
              currentOpenedAlbum={index === 0 ? currentOpenedAlbum : undefined}
            />
          </div>
        ))}
      </main>
    </>
  );
};
