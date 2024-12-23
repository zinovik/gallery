import {
  AlbumInterface,
  FileInterface,
  Host,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import { PARAMETER_DATE_RANGES, PARAMETER_FILE } from '../constants';
import { Location, Params } from 'react-router-dom';

export const parseUrl = (
  params: Params<string>,
  searchParams: URLSearchParams,
  location: Location
): {
  path: string;
  dateRanges?: string[][];
  scrolledToFile: string;
  scrolledToAlbum: string;
} => {
  const { '*': route = '' } = params;
  const pathRoute = `${route}`.replace(/\/+$/, '');

  const dateRangesParameter = searchParams.get(PARAMETER_DATE_RANGES);
  const dateRanges = dateRangesParameter
    ?.split(',')
    .map((dateRange) => dateRange.split('-'));

  const path = pathRoute || (dateRanges ? '' : '/');

  const scrolledToFile = searchParams.get(PARAMETER_FILE) ?? '';
  const scrolledToAlbum = location.hash.substring(1);

  return {
    path,
    dateRanges,
    scrolledToFile,
    scrolledToAlbum,
  };
};

export const getLevel = (path: string): number => path.split('/').length;

export const getLink = (path: string, defaultByDate?: boolean) =>
  `/${path}${defaultByDate ? `?${PARAMETER_DATE_RANGES}=` : ''}`;

export const getLinks = (
  path: string,
  albums: AlbumInterface[]
): { text: string; url: string }[] =>
  path
    .split('/')
    .slice(0, -1)
    .map((text, index, texts) => {
      const textPath = texts.slice(0, index + 1).join('/');

      const album = albums.find((album) => album.path === textPath);

      const defaultByDate = album && album.defaultByDate;

      return {
        text,
        url: getLink(textPath, defaultByDate),
      };
    });

export const formatDatetime = (datetime?: string): string => {
  if (!datetime) return '';

  const date = datetime.slice(6, 8);
  const month = datetime.slice(4, 6);
  const year = datetime.slice(0, 4);
  const hour = datetime.slice(9, 11);
  const minute = datetime.slice(11, 13);

  const datePart = `${date}.${month}.${year}`;
  const timePart = ` ${hour}:${minute}`;

  return `${year && month && date ? datePart : ''}${
    hour && minute ? timePart : ''
  }`;
};

export const getThumbnail = (url: string, width: number): string => {
  if (url.includes(Host.cloudinary)) {
    const LEVEL = width < 400 ? '0.3' : '0.6';

    return url.replace('/upload/v', `/upload/c_scale,h_${LEVEL},w_${LEVEL}/v`);
  }

  return url;
};

export const getUpdatedAlbumChangedFields = (
  updatedAlbum: UpdatedAlbum,
  currentAlbum?: AlbumInterface
): {
  updatedAlbumChangedFields: Partial<AlbumInterface> & { path: string };
  newPath?: string | null;
} => {
  const updatedAlbumChangedFields = {
    path: updatedAlbum.path,
    ...(updatedAlbum.title !== currentAlbum?.title
      ? { title: updatedAlbum.title }
      : {}),
    ...(updatedAlbum.text !== (currentAlbum?.text || '')
      ? { text: updatedAlbum.text }
      : {}),
    ...(updatedAlbum.accesses?.join(',') !==
    (currentAlbum?.accesses || []).join(',')
      ? { accesses: updatedAlbum.accesses }
      : {}),
  };

  const newPath =
    updatedAlbum.newPath !== currentAlbum?.path ? updatedAlbum.newPath : null;

  return { updatedAlbumChangedFields, newPath };
};

export const getUpdatedFileChangedFields = (
  updatedFile: UpdatedFile,
  currentFile?: FileInterface
): {
  updatedFileChangedFields: Partial<FileInterface> & { filename: string };
} => {
  const updatedFileChangedFields = {
    filename: updatedFile.filename,
    ...(updatedFile.path !== currentFile?.path
      ? { path: updatedFile.path }
      : {}),
    ...(updatedFile.description !== currentFile?.description
      ? { description: updatedFile.description }
      : {}),
    ...(updatedFile.text !== (currentFile?.text || '')
      ? { text: updatedFile.text }
      : {}),
    ...(updatedFile.accesses?.join(',') !==
    (currentFile?.accesses || []).join(',')
      ? {
          accesses: updatedFile.accesses,
        }
      : {}),
  };

  return { updatedFileChangedFields };
};
