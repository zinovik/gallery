import type {
  AlbumInterface,
  FileInterface,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import {
  PARAMETER_DATE_RANGES,
  PARAMETER_FILE,
  PARAMETER_TOKEN,
} from '../constants';
import type { Location, Params } from 'react-router-dom';

export const parseUrl = (
  params: Params<string>,
  searchParams: URLSearchParams,
  location: Location,
): {
  currentPath: string;
  dateRanges?: string[][];
  token: string;
  scrolledToFile: string;
  scrolledToAlbum: string;
} => {
  const { '*': route = '' } = params;
  const currentPath = `${route}`.replace(/\/+$/, '');

  const dateRangesParameter = searchParams.get(PARAMETER_DATE_RANGES);
  const dateRanges = dateRangesParameter
    ?.split(',')
    .map((dateRange) => dateRange.split('-'));

  const scrolledToFile = searchParams.get(PARAMETER_FILE) ?? '';
  const scrolledToAlbum = location.hash.substring(1);

  const token = searchParams.get(PARAMETER_TOKEN) || '';

  return {
    currentPath,
    dateRanges,
    scrolledToFile,
    scrolledToAlbum,
    token,
  };
};

export const getLevel = (path: string): number => path.split('/').length;

export const getLink = (path: string, defaultByDate?: boolean) =>
  `/${path}${defaultByDate ? `?${PARAMETER_DATE_RANGES}=` : ''}`;

export const getLinks = ({
  albumPath = '',
  currentPath = '',
  allAlbums,
  isAlbumTitle,
}: {
  albumPath?: string;
  currentPath?: string;
  allAlbums: AlbumInterface[];
  isAlbumTitle?: boolean;
}): { text: string; url: string }[] => {
  const links = albumPath.split('/').map((_text, index, texts) => {
    const textPath = texts.slice(0, index + 1).join('/');

    const album = allAlbums.find((album) => album.path === textPath);
    const url = getLink(textPath);

    return {
      text: album?.title || 'not found',
      url,
      ...(album ? {} : { isGenerateAlbum: true }),
    };
  });

  if (isAlbumTitle) {
    const skipNumber = currentPath
      .split('/')
      .filter((path) => path !== '').length;

    return links.slice(skipNumber);
  }

  return [
    {
      text: 'Home',
      url: '/',
    },
    ...links.slice(0, -1),
  ];
};

export const formatDatetime = (datetime?: string): string => {
  if (!datetime) return '';

  const date = datetime.slice(6, 8);
  const month = datetime.slice(4, 6);
  const year = datetime.slice(0, 4);
  const hour = datetime.slice(9, 11);
  const minute = datetime.slice(11, 13);

  const datePart = `${date ? `${date}.` : ''}${
    month ? `${month}.` : ''
  }${year}`;
  const timePart = ` ${hour}:${minute}`;

  return `${year ? datePart : ''}${hour && minute ? timePart : ''}`;
};

export const getUpdatedAlbumChangedFields = (
  updatedAlbum: UpdatedAlbum,
  currentAlbum: AlbumInterface,
): {
  updatedAlbumChangedFields: UpdatedAlbum;
  newPath?: string | null;
} => {
  const updatedAlbumChangedFields = {
    path: updatedAlbum.path,
    ...(updatedAlbum.title !== undefined &&
    updatedAlbum.title !== currentAlbum.title
      ? { title: updatedAlbum.title }
      : {}),
    ...(updatedAlbum.text !== undefined &&
    updatedAlbum.text !== (currentAlbum.text || '')
      ? { text: updatedAlbum.text }
      : {}),
    ...(updatedAlbum.defaultByDate !== undefined &&
    Boolean(updatedAlbum.defaultByDate) !== Boolean(currentAlbum.defaultByDate)
      ? { defaultByDate: updatedAlbum.defaultByDate }
      : {}),
    ...(updatedAlbum.order !== undefined &&
    updatedAlbum.order !== (currentAlbum.order || 0)
      ? { order: updatedAlbum.order }
      : {}),
    ...(updatedAlbum.accesses !== undefined &&
    updatedAlbum.accesses.join(',') !== (currentAlbum.accesses ?? []).join(',')
      ? { accesses: updatedAlbum.accesses }
      : {}),
    ...(updatedAlbum.defaultAccesses !== undefined &&
    updatedAlbum.defaultAccesses.join(',') !==
      (currentAlbum.defaultAccesses ?? []).join(',')
      ? { defaultAccesses: updatedAlbum.defaultAccesses }
      : {}),
  };

  const newPath =
    updatedAlbum.newPath !== currentAlbum.path ? updatedAlbum.newPath : null;

  return { updatedAlbumChangedFields, newPath };
};

export const getUpdatedFileChangedFields = (
  updatedFile: UpdatedFile,
  currentFile: Partial<FileInterface> & { filename: string },
): UpdatedFile => {
  return {
    filename: updatedFile.filename,
    ...(updatedFile.path !== undefined && updatedFile.path !== currentFile.path
      ? { path: updatedFile.path }
      : {}),
    ...(updatedFile.description !== undefined &&
    updatedFile.description !== (currentFile.description || '')
      ? { description: updatedFile.description }
      : {}),
    ...(updatedFile.text !== undefined &&
    updatedFile.text !== (currentFile.text || '')
      ? { text: updatedFile.text }
      : {}),
    ...(updatedFile.accesses !== undefined &&
    updatedFile.accesses.join(',') !== (currentFile.accesses ?? []).join(',')
      ? {
          accesses: updatedFile.accesses,
        }
      : {}),
  };
};

export const uniqueBy = <T>(items: T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const value = key(item);

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
};

export const uniqueFiles = (
  ...fileGroups: FileInterface[][]
): FileInterface[] => uniqueBy(fileGroups.flat(), (file) => file.filename);

export const uniqueAlbums = (
  ...albumGroups: AlbumInterface[][]
): AlbumInterface[] => uniqueBy(albumGroups.flat(), (album) => album.path);

export const convertDateRangesToParameterString = (
  dateRanges: string[][],
): string => `${dateRanges.map((dateRange) => dateRange.join('-')).join(',')}`;

export const getPathWithDateRanges = (
  path: string,
  dateRanges?: string[][],
): string =>
  `${path}${
    dateRanges &&
    dateRanges.find((dateRange) => dateRange.find((date) => date !== ''))
      ? `?${PARAMETER_DATE_RANGES}=${convertDateRangesToParameterString(
          dateRanges,
        )}`
      : ''
  }`;

export const isThisOrChildPath = (
  currentItemPath: string,
  requiredPath: string,
): boolean =>
  currentItemPath === requiredPath ||
  currentItemPath.startsWith(`${requiredPath}/`);

export const getShouldLoad = (
  loadedPaths: string[],
  currentPath: string,
  dateRanges?: string[][],
): boolean => {
  const path = getPathWithDateRanges(currentPath, dateRanges);

  // TODO: Check if dates are included in the loaded dates

  return loadedPaths.every(
    (loadedPath) => !isThisOrChildPath(path, loadedPath),
  );
};
