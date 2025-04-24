import { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathAndDateRanges,
} from './filtersByPathAndDateRanges';
import { sortAlbums } from './sort';
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

  const allAlbumsWithGenerated = sortAlbums(
    uniqueAlbums(allAlbums, getAlbumsFromFiles(allFiles))
  );

  const albums = filterAlbumsByPath({
    albums: allAlbumsWithGenerated,
    currentPath,
    isShowingByDate: Boolean(dateRanges),
  });

  if (dateRanges) {
    const albumsByPathMap: Record<string, AlbumInterface> = {};
    albums.forEach((album) => {
      albumsByPathMap[album.path] = album;
    });

    const albumsWithFiles: AlbumWithFiles[] = [];

    // reverse order (by date)
    [...files].reverse().forEach((file) => {
      if (
        albumsWithFiles.length === 0 ||
        albumsWithFiles[albumsWithFiles.length - 1].album.path !== file.path
      ) {
        const isNotFirstAlbum = albumsWithFiles.some(
          ({ album }) => album.path === albumsByPathMap[file.path].path
        );

        albumsWithFiles.push({
          album: {
            ...albumsByPathMap[file.path],
            ...(isNotFirstAlbum ? { text: '' } : {}),
          },
          files: [file],
        });
      } else {
        albumsWithFiles[albumsWithFiles.length - 1].files.push(file);
      }
    });

    return albumsWithFiles;
  }

  const albumsOrdered = currentPath === '' ? [...albums].reverse() : albums; // reverse order for home page (by albums)

  return albumsOrdered.map((album) => ({
    album,
    files: files.filter((file) => file.path === album.path),
  }));
};
