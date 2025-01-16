import { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathAndDateRanges,
} from './filtersByPathAndDateRanges';
import { getAlbumsFromFiles, uniqueAlbums } from './utils';

export const getAlbumsWithFilesToShow = ({
  allAlbums,
  allFiles,
  currentPath,
  dateRanges,
}: {
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  currentPath: string;
  dateRanges?: string[][];
}): AlbumWithFiles[] => {
  const files = filterFilesByPathAndDateRanges({
    files: allFiles,
    currentPath,
    dateRanges,
  });

  const allAlbumsWithGenerated = uniqueAlbums(
    allAlbums,
    getAlbumsFromFiles(allFiles)
  );

  const albums = filterAlbumsByPath({
    albums: allAlbumsWithGenerated,
    currentPath,
    isShowingByDate: Boolean(dateRanges),
  });

  if (dateRanges) {
    const albumsMap: Record<string, AlbumInterface> = {};
    albums.forEach((album) => {
      albumsMap[album.path] = album;
    });

    const albumsWithFiles: AlbumWithFiles[] = [];

    [...files].reverse().forEach((file) => {
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

  const albumsOrdered = currentPath === '' ? [...albums].reverse() : albums;

  return albumsOrdered.map((album) => ({
    album,
    files: files.filter((file) => file.path === album.path),
  }));
};
