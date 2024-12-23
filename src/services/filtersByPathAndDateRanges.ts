import { AlbumInterface, FileInterface } from '../types';

const isThisOrChildPath = (childPath: string, parentPath: string): boolean =>
  childPath === parentPath || childPath.startsWith(`${parentPath}/`);

const isTopLevelPath = (path: string): boolean => !path.includes('/');

export const filterAlbumsByPath = ({
  albums,
  path,
}: {
  albums: AlbumInterface[];
  path: string;
}): AlbumInterface[] => {
  return path === ''
    ? albums
    : albums.filter((album) =>
        path === '/'
          ? isTopLevelPath(album.path)
          : isThisOrChildPath(album.path, path)
      );
};

export const filterFilesByPathAndDateRanges = ({
  files,
  path,
  dateRanges,
}: {
  files: FileInterface[];
  path?: string;
  dateRanges?: string[][];
}): FileInterface[] =>
  files.filter((file) => {
    if (path && !isThisOrChildPath(file.path, path)) {
      return false;
    }

    if (
      dateRanges &&
      !dateRanges.some(
        ([from, to]) =>
          (!from || file.datetime.slice(0, from.length) >= from) &&
          (!to || file.datetime.slice(0, to.length) <= to)
      )
    ) {
      return false;
    }

    return true;
  });
