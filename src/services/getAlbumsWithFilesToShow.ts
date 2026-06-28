import type { AlbumInterface, AlbumWithFiles, FileInterface } from '../types';
import {
  filterAlbumsByPath,
  filterFilesByPathAndDateRanges,
} from './filtersByPathAndDateRanges';

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
  const random = Math.random();
  console.time(`getAlbumsWithFilesToShow ${random}`);

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

  if (dateRanges) {
    const albumsByPathMap = new Map<string, AlbumInterface>();
    albums.forEach((album) => {
      albumsByPathMap.set(album.path, album);
    });

    const albumsWithFiles: AlbumWithFiles[] = [];

    // reverse order (by date)
    [...files].reverse().forEach((file) => {
      if (
        albumsWithFiles.length === 0 ||
        albumsWithFiles[albumsWithFiles.length - 1].album.path !== file.path
      ) {
        const isNotFirstAlbum = albumsWithFiles.some(
          ({ album }) => album.path === albumsByPathMap.get(file.path)?.path,
        );

        albumsWithFiles.push({
          album: {
            path: '', // for ts
            title: '', // for ts
            ...albumsByPathMap.get(file.path),
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

  const result = albumsOrdered.map((album) => ({
    album,
    files: files.filter((file) => file.path === album.path),
  }));

  console.timeEnd(`getAlbumsWithFilesToShow ${random}`);

  return result;
};
