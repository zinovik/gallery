import {
  AddedAlbum,
  AlbumInterface,
  Changes,
  FileInterface,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import { sortAlbums, sortFiles } from './sort';

const removeAlbums = (
  albums: AlbumInterface[],
  removedAlbums: RemovedAlbum[]
): AlbumInterface[] => {
  if (removedAlbums.length === 0) return albums;

  const removedAlbumPaths = removedAlbums.map((album) => album.path);

  return albums.filter((album) => !removedAlbumPaths.includes(album.path));
};

const removeFiles = (
  files: FileInterface[],
  removedFiles: RemovedFile[]
): FileInterface[] => {
  if (removedFiles.length === 0) return files;

  const removedFileFilenames = removedFiles.map((file) => file.filename);

  return files.filter((file) => !removedFileFilenames.includes(file.filename));
};

const addAlbums = (
  albums: AlbumInterface[],
  addedAlbums: AddedAlbum[]
): AlbumInterface[] => {
  if (addedAlbums.length === 0) return albums;

  const albumsWithAdded = [...albums];

  addedAlbums.forEach((addedAlbum) => {
    const relatedPathIndex = albumsWithAdded.findIndex(
      (album) => album.path === addedAlbum.relatedPath
    );

    if (relatedPathIndex === -1) return;

    albumsWithAdded.splice(
      relatedPathIndex + (addedAlbum.relation === 'before' ? 0 : 1),
      0,
      {
        title: addedAlbum.title,
        text: addedAlbum.text || undefined,
        filesAmount: 0,
        path: addedAlbum.path,
      }
    );
  });

  return albumsWithAdded;
};

const updateAlbums = (
  albums: AlbumInterface[],
  updatedAlbums: UpdatedAlbum[]
): AlbumInterface[] => {
  if (updatedAlbums.length === 0) return albums;

  const albumsWithUpdated = albums.map((album) => {
    const updatedAlbum = updatedAlbums.find(
      (updatedAlbum) => updatedAlbum.path === album.path
    );

    if (!updatedAlbum) return album;

    const { newPath, ...updatedAlbumFields } = updatedAlbum;

    return {
      ...album,
      ...updatedAlbumFields,
      ...(newPath ? { path: newPath } : {}),
    };
  });

  return albumsWithUpdated;
};

const updateFiles = (files: FileInterface[], updatedFiles: UpdatedFile[]) => {
  if (updatedFiles.length === 0) return files;

  const filesWithUpdated = files.map((file) => {
    const updatedFile = updatedFiles.find(
      (updatedFile) => updatedFile.filename === file.filename
    );

    if (!updatedFile) return file;

    return {
      ...file,
      ...updatedFile,
    };
  });

  return filesWithUpdated;
};

export const applyChanges = ({
  allAlbums,
  allFiles,
  changes,
}: {
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  changes: Changes;
}) => {
  const {
    remove: { albums: removedAlbums, files: removedFiles },
    add: { albums: addedAlbums },
    update: { albums: updatedAlbums, files: updatedFiles },
  } = changes;

  const albumsWithoutRemoved = removeAlbums(allAlbums, removedAlbums);
  const filesWithoutRemoved = removeFiles(allFiles, removedFiles);

  const albumsWithAdded = addAlbums(albumsWithoutRemoved, addedAlbums);

  const albumsWithUpdated = updateAlbums(albumsWithAdded, updatedAlbums);
  const filesWithUpdated = updateFiles(filesWithoutRemoved, updatedFiles);

  const sortedAlbums = sortAlbums(albumsWithUpdated);
  const sortedFiles = sortFiles(filesWithUpdated, sortedAlbums);

  return { albums: sortedAlbums, files: sortedFiles };
};
