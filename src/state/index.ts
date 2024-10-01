import { sortAlbums, sortFiles } from './sort';
import {
  AddedAlbum,
  AlbumInterface,
  FileInterface,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import { getLevel } from '../utils';

type User = {
  email: string;
  accesses: string[];
  isEditAccess?: boolean;
};

export const state = {
  allAlbums: [] as AlbumInterface[],
  allFiles: [] as FileInterface[],
  user: null as User | null,
  isEditModeEnabled: false,
  removedAlbums: [] as RemovedAlbum[],
  removedFiles: [] as RemovedFile[],
  addedAlbums: [] as AddedAlbum[],
  updatedAlbums: [] as UpdatedAlbum[],
  updatedFiles: [] as UpdatedFile[],
};

export const addAddedAlbum = (addedAlbum: AddedAlbum): void => {
  state.addedAlbums.push(addedAlbum);

  // update loadedAlbums
  const albumsWithAdded = [...state.allAlbums];

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
      path:
        addedAlbum.relation === 'in'
          ? `${addedAlbum.relatedPath}/${addedAlbum.pathPart}`
          : getLevel(addedAlbum.relatedPath) === 1
          ? addedAlbum.pathPart
          : `${addedAlbum.relatedPath.slice(
              0,
              addedAlbum.relatedPath.lastIndexOf('/')
            )}/${addedAlbum.pathPart}`,
    }
  );

  state.allAlbums = sortAlbums(albumsWithAdded);
  state.allFiles = sortFiles(state.allFiles, state.allAlbums);
};

export const addUpdatedAlbum = (updatedAlbum: UpdatedAlbum): void => {
  let isUpdated = false;
  state.updatedAlbums = state.updatedAlbums.map((alreadyUpdatedAlbum) => {
    if (
      (alreadyUpdatedAlbum.newPath || alreadyUpdatedAlbum.path) ===
      updatedAlbum.path
    ) {
      isUpdated = true;
      return updatedAlbum;
    }
    return alreadyUpdatedAlbum;
  });
  if (!isUpdated) state.updatedAlbums.push(updatedAlbum);

  // loadedAlbums update
  const loadedAlbumsUpdated = state.allAlbums.map((album) =>
    album.path === updatedAlbum.path
      ? {
          ...album,
          ...(updatedAlbum.newPath ? { path: updatedAlbum.newPath } : {}),
          ...(updatedAlbum.title ? { title: updatedAlbum.title } : {}),
          ...(updatedAlbum.text !== undefined
            ? { text: updatedAlbum.text || undefined }
            : {}),
          ...(updatedAlbum.accesses !== undefined
            ? {
                accesses:
                  updatedAlbum.accesses.length > 0
                    ? updatedAlbum.accesses
                    : undefined,
              }
            : {}),
        }
      : album
  );

  state.allAlbums = sortAlbums(loadedAlbumsUpdated);
  state.allFiles = sortFiles(state.allFiles, state.allAlbums);
};

export const addUpdatedFile = (updatedFile: UpdatedFile): void => {
  let isUpdated = false;
  state.updatedFiles = state.updatedFiles.map((alreadyUpdatedFile) => {
    if (alreadyUpdatedFile.filename === updatedFile.filename) {
      isUpdated = true;
      return updatedFile;
    }
    return alreadyUpdatedFile;
  });
  if (!isUpdated) state.updatedFiles.push(updatedFile);

  // allFiles update
  const files = state.allFiles.map((file) =>
    file.filename === updatedFile.filename
      ? {
          ...file,
          ...(updatedFile.path ? { path: updatedFile.path } : {}),
          ...(updatedFile.isTitle !== undefined
            ? { isTitle: updatedFile.isTitle || undefined }
            : {}),
          ...(updatedFile.description
            ? { description: updatedFile.description }
            : {}),
          ...(updatedFile.text !== undefined
            ? { text: updatedFile.text || undefined }
            : {}),
          ...(updatedFile.accesses !== undefined
            ? {
                accesses:
                  updatedFile.accesses.length > 0
                    ? updatedFile.accesses
                    : undefined,
              }
            : {}),
        }
      : file
  );
  state.allFiles = sortFiles(files, state.allAlbums);
};

export const addRemovedAlbum = (removedAlbum: RemovedAlbum): void => {
  state.removedAlbums.push(removedAlbum);

  state.allAlbums = state.allAlbums.filter(
    (album) => album.path !== removedAlbum.path
  );
};

export const addRemovedFile = (removedFile: RemovedFile): void => {
  state.removedFiles.push(removedFile);

  state.allFiles = state.allFiles.filter(
    (file) => file.filename !== removedFile.filename
  );
};

export const getUser = () => state.user || null;

export const setUser = (user: User | null) => {
  state.user = user;
};

export const setAllAlbums = (allAlbums: AlbumInterface[]) => {
  state.allAlbums = allAlbums;
};

export const setAllFiles = (allFiles: FileInterface[]) => {
  state.allFiles = allFiles;
};

export const resetUpdated = () => {
  state.removedAlbums = [];
  state.removedFiles = [];
  state.addedAlbums = [];
  state.updatedAlbums = [];
  state.updatedFiles = [];
};

export const getUpdated = () => ({
  removedAlbums: state.removedAlbums,
  removedFiles: state.removedFiles,
  addedAlbums: state.addedAlbums,
  updatedAlbums: state.updatedAlbums,
  updatedFiles: state.updatedFiles,
});

export const switchEditMode = () => {
  state.isEditModeEnabled = !state.isEditModeEnabled;
};

export const getIsEditModeEnabled = () => state.isEditModeEnabled;
