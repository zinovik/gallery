import type { AlbumInterface, FileInterface } from '../types';
import { isThisOrChildPath } from './utils';

const isTopLevelPath = (path: string): boolean => !path.includes('/');

export const filterAlbumsByPath = ({
  albums,
  currentPath,
  isShowingByDate,
}: {
  albums: AlbumInterface[];
  currentPath: string;
  isShowingByDate: boolean;
}): AlbumInterface[] => {
  return albums.filter((album) =>
    currentPath === ''
      ? isShowingByDate || isTopLevelPath(album.path)
      : isThisOrChildPath(album.path, currentPath)
  );
};

export const filterFilesByPathAndDateRanges = ({
  files,
  currentPath,
  dateRanges,
}: {
  files: FileInterface[];
  currentPath?: string;
  dateRanges?: string[][];
}): FileInterface[] =>
  files.filter((file) => {
    if (currentPath && !isThisOrChildPath(file.path, currentPath)) {
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
