import type { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathAndDateRanges,
} from './filtersByPathAndDateRanges';

const buildByDate = (albums: AlbumInterface[], files: FileInterface[]) => {
  const albumsByPathMap = new Map<string, AlbumInterface>();
  albums.forEach((album) => albumsByPathMap.set(album.path, album));

  const albumsWithFiles: AlbumWithFiles[] = [];
  const addedAlbums = new Set<string>();

  // reverse order (by date)
  [...files].reverse().forEach((file) => {
    if (
      albumsWithFiles.length === 0 ||
      albumsWithFiles[albumsWithFiles.length - 1].album.path !== file.path
    ) {
      const album = albumsByPathMap.get(file.path);
      if (!album) throw new Error(`Album does not exist: ${file.path}`);

      albumsWithFiles.push({
        album: addedAlbums.has(album.path)
          ? { ...album, text: undefined }
          : album,
        files: [file],
      });
    } else {
      // the last album is the save - just add the file
      albumsWithFiles[albumsWithFiles.length - 1].files.push(file);
    }
    addedAlbums.add(file.path);
  });

  return albumsWithFiles;
};

const buildByAlbums = (
  albums: AlbumInterface[],
  files: FileInterface[],
  currentPath: string,
) => {
  const albumsOrdered = currentPath === '' ? [...albums].reverse() : albums; // reverse order for home page (by albums)

  const filesByPath = new Map<string, FileInterface[]>();
  files.forEach((file) => {
    const array = filesByPath.get(file.path) ?? [];
    array.push(file);
    filesByPath.set(file.path, array);
  });

  return albumsOrdered.map((album) => ({
    album,
    files: filesByPath.get(album.path) ?? [],
  }));
};

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

  const albums = filterAlbumsByPath({
    albums: allAlbums,
    currentPath,
    isShowingByDate: Boolean(dateRanges),
  });

  return dateRanges
    ? buildByDate(albums, files)
    : buildByAlbums(albums, files, currentPath);
};
