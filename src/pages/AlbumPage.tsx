import React from 'react';
import { Album } from '../components/Album';
import { AgendaInterface, AlbumWithFiles } from '../types';
import { Navigation } from '../components/Navigation';

interface Props {
  albumsWithFiles: AlbumWithFiles[];
  path: string;
  isHiddenHashLink: boolean;
  currentFile: string | null;
}

export const AlbumPage = ({
  albumsWithFiles,
  path,
  isHiddenHashLink,
  currentFile,
}: Props) => {
  const albumAgenda: AgendaInterface[] = albumsWithFiles
    .slice(1)
    .map((albumWithFiles) => ({
      title: albumWithFiles.album.title,
      path: albumWithFiles.album.path,
    }));

  return (
    <>
      {albumsWithFiles.length > 0 && <Navigation path={path} />}

      <main>
        {albumsWithFiles.map((albumWithFiles) => (
          <div
            id={path}
            key={
              albumWithFiles.album.path +
              '-' +
              albumWithFiles.files.map((file) => file.filename).join(',')
            }
          >
            <Album
              albumWithFiles={albumWithFiles}
              isCurrentOpenedAlbum={albumWithFiles.album.path === path}
              albumAgenda={albumAgenda}
              currentFile={currentFile}
              isHiddenHashLink={isHiddenHashLink}
            />
          </div>
        ))}
      </main>
    </>
  );
};
