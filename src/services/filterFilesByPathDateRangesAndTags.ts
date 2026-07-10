import type { AlbumInterface, FileInterface } from '../types';
import { isThisOrChildPath } from './utils';

const isRootPath = (path: string): boolean => !path.includes('/');

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
      ? isShowingByDate || isRootPath(album.path)
      : isThisOrChildPath(album.path, currentPath),
  );
};

export const filterFilesByPathDateRangesAndTags = ({
  files,
  currentPath,
  dateRanges,
  tags,
}: {
  files: FileInterface[];
  currentPath?: string;
  dateRanges?: string[][];
  tags?: string[];
}): FileInterface[] =>
  files.filter((file) => {
    const filePath = file.resolved?.path ?? file.path ?? 'NOT RESOLVED';

    if (currentPath && !isThisOrChildPath(filePath, currentPath)) {
      return false;
    }

    if (
      dateRanges &&
      !dateRanges.some(
        ([from, to]) =>
          (!from || file.datetime.slice(0, from.length) >= from) &&
          (!to || file.datetime.slice(0, to.length) <= to),
      )
    ) {
      return false;
    }

    if (tags && !tags.some((tag) => file.tags?.includes(tag))) {
      return false;
    }

    return true;
  });
