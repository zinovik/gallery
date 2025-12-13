import { Album } from '../components/Album';
import type { AgendaInterface, AlbumWithFiles } from '../types';
import { Navigation } from '../components/Navigation';
import { useAppSelector } from '../app/hooks';
import { selectAllAlbums } from '../app/stateSlices/allAlbumsAndFilesSlice';

interface Props {
  albumsWithFiles: AlbumWithFiles[];
  currentPath: string;
  isShowingByDate: boolean;
  currentFile: string | null;
}

export const AlbumPage = ({
  albumsWithFiles,
  currentPath,
  isShowingByDate,
  currentFile,
}: Props) => {
  const allAlbums = useAppSelector(selectAllAlbums);

  const albumAgenda: AgendaInterface[] = albumsWithFiles
    .slice(1)
    .map((albumWithFiles) => ({
      title: albumWithFiles.album.title,
      path: albumWithFiles.album.path,
    }));

  const currentOpenedAlbum = allAlbums.find(
    (album) => album.path === currentPath
  );

  return (
    <>
      {albumsWithFiles.length > 0 && <Navigation albumPath={currentPath} />}

      <main>
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
              isShowingByDate={isShowingByDate}
              currentOpenedAlbum={index === 0 ? currentOpenedAlbum : undefined}
            />
          </div>
        ))}
      </main>
    </>
  );
};
