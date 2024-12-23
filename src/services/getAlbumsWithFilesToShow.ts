import { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathAndDateRanges,
} from './filtersByPathAndDateRanges';

export const getAlbumsWithFilesToShow = ({
  allAlbums,
  allFiles,
  path,
  dateRanges,
}: {
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  path: string;
  dateRanges?: string[][];
}): AlbumWithFiles[] => {
  const albums = filterAlbumsByPath({ albums: allAlbums, path });
  const files = filterFilesByPathAndDateRanges({
    files: allFiles,
    path,
    dateRanges,
  });

  if (dateRanges) {
    const albumsMap: Record<string, AlbumInterface> = {};
    albums.forEach((album) => {
      albumsMap[album.path] = album;
    });

    const albumsWithFiles: AlbumWithFiles[] = [];

    files
      .sort((file1, file2) => file2.datetime.localeCompare(file1.datetime))
      .forEach((file) => {
        if (
          albumsWithFiles.length === 0 ||
          albumsWithFiles[albumsWithFiles.length - 1].album.path !== file.path
        ) {
          albumsWithFiles.push({ album: albumsMap[file.path], files: [file] });
        } else {
          albumsWithFiles[albumsWithFiles.length - 1].files.push(file);
        }
      });

    return albumsWithFiles;
  }

  const albumsOrdered = path === '/' ? [...albums].reverse() : albums;

  return albumsOrdered.map((album) => ({
    album,
    files: files.filter((file) => file.path === album.path),
  }));
};
