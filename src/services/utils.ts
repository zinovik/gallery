import type {
  AlbumInterface,
  FileInterface,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import {
  PARAMETER_DATE_RANGES,
  PARAMETER_FILE,
  PARAMETER_TAGS,
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
  tags?: string[];
  token: string | null;
  scrolledToFile: string | null;
  scrolledToAlbum: string;
} => {
  const { '*': route = '' } = params;
  const currentPath = `${route}`.replace(/\/+$/, '');

  const dateRangesParameter = searchParams.get(PARAMETER_DATE_RANGES);
  const dateRanges = dateRangesParameter
    ?.split(',')
    .map((dateRange) => dateRange.split('-'));

  const tagsParameter = searchParams.get(PARAMETER_TAGS);
  const tags = tagsParameter?.split(',');

  const scrolledToFile = searchParams.get(PARAMETER_FILE);
  const scrolledToAlbum = location.hash.substring(1);

  const token = searchParams.get(PARAMETER_TOKEN);

  return {
    currentPath,
    dateRanges,
    tags,
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

    const albumTitle = album?.title ?? album?.resolved?.title ?? 'NOT RESOLVED';

    return {
      text: albumTitle,
      url,
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
  const currentAlbumTitle =
    currentAlbum.title ?? currentAlbum.resolved?.title ?? 'NOT RESOLVED';

  const updatedAlbumChangedFields = {
    path: updatedAlbum.path,
    ...(updatedAlbum.title !== undefined &&
    updatedAlbum.title !== currentAlbumTitle
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
  const currentFilePath =
    currentFile.path ?? currentFile.resolved?.path ?? 'NOT RESOLVED';

  return {
    filename: updatedFile.filename,
    ...(updatedFile.path !== undefined && updatedFile.path !== currentFilePath
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
    ...(updatedFile.tags !== undefined &&
    updatedFile.tags.join(',') !== (currentFile.tags ?? []).join(',')
      ? {
          tags: updatedFile.tags,
        }
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

export const isThisOrChildPath = (
  currentItemPath: string,
  requiredPath: string,
): boolean =>
  currentItemPath === requiredPath ||
  currentItemPath.startsWith(`${requiredPath}/`);

export const getShouldLoad = (
  loadedRequests: {
    path: string;
    dateRanges?: string[][];
    tags?: string[];
  }[],
  currentPath: string,
  dateRanges?: string[][],
  tags?: string[],
): boolean => {
  const thisOrParentPathRequests = loadedRequests.filter((loadedRequest) =>
    isThisOrChildPath(currentPath, loadedRequest.path),
  );

  // didn't load this path
  if (thisOrParentPathRequests.length === 0) {
    return true;
  }

  for (const loadedRequest of thisOrParentPathRequests) {
    const loadedAllDateRanges =
      (!loadedRequest.dateRanges && currentPath !== '') ||
      loadedRequest.dateRanges?.every(([from, to]) => !from && !to);

    const loadedAllTags = !loadedRequest.tags;

    const homeLoaded =
      loadedRequest.path === '' &&
      !loadedRequest.dateRanges &&
      !loadedRequest.tags;

    if (currentPath === '' && !dateRanges && !tags && homeLoaded) {
      return false;
    }

    // loaded all for this path
    if (loadedAllDateRanges && loadedAllTags) {
      return false;
    }

    if (
      JSON.stringify({
        dateRanges: loadedRequest.dateRanges,
        tags: loadedRequest.tags,
      }) ===
      JSON.stringify({
        dateRanges: dateRanges,
        tags: tags,
      })
    ) {
      return false;
    }
  }

  return true;
};
