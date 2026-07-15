import type { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathDateRangesAndTags,
} from './filterFilesByPathDateRangesAndTags';

const buildByDate = (albums: AlbumInterface[], files: FileInterface[]) => {
  const albumsByPathMap = new Map<string, AlbumInterface>();
  albums.forEach((album) => albumsByPathMap.set(album.path, album));

  const albumsWithFiles: AlbumWithFiles[] = [];
  const addedAlbums = new Set<string>();

  // reverse order (by date)
  [...files].reverse().forEach((file) => {
    const filePath = file.path ?? file.resolved?.path ?? 'NOT RESOLVED';

    if (
      albumsWithFiles.length === 0 ||
      albumsWithFiles[albumsWithFiles.length - 1].album.path !== filePath
    ) {
      const album = albumsByPathMap.get(filePath) ?? { path: filePath };

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
    addedAlbums.add(filePath);
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
    const filePath = file.path ?? file.resolved?.path ?? 'NOT RESOLVED';
    const array = filesByPath.get(filePath) ?? [];
    array.push(file);
    filesByPath.set(filePath, array);
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
  tags,
}: {
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  currentPath: string;
  dateRanges?: string[][];
  tags?: string[];
}): AlbumWithFiles[] => {
  const files = filterFilesByPathDateRangesAndTags({
    files: allFiles,
    currentPath,
    dateRanges,
    tags,
  });

  const albums = filterAlbumsByPath({
    albums: allAlbums,
    currentPath,
    isShowingByDate: Boolean(dateRanges),
  });

  return dateRanges || tags
    ? buildByDate(albums, files)
    : buildByAlbums(albums, files, currentPath);
};
