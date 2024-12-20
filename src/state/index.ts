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
  loadedMainPaths: [] as string[],
  isEverythingLoaded: false,
  mainPath: '',
  byDate: false,
  selectedFiles: [] as string[],
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
      filesAmount: 0,
      path: addedAlbum.path,
    }
  );

  state.allAlbums = sortAlbums(albumsWithAdded);
  state.allFiles = sortFiles(state.allFiles, state.allAlbums);
};

export const addUpdatedAlbum = (updatedAlbum: UpdatedAlbum): void => {
  const currentAlbum = state.allAlbums.find(
    (album) => album.path === updatedAlbum.path
  );
  const newPath =
    updatedAlbum.newPath !== currentAlbum?.path ? updatedAlbum.newPath : null;
  console.log(newPath);
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

  let isUpdated = false;
  state.updatedAlbums = state.updatedAlbums.map((alreadyUpdatedAlbum) => {
    if (
      (alreadyUpdatedAlbum.newPath || alreadyUpdatedAlbum.path) ===
      updatedAlbumChangedFields.path
    ) {
      isUpdated = true;
      return {
        ...alreadyUpdatedAlbum,
        ...updatedAlbumChangedFields,
        ...(newPath ? { newPath } : {}),
      };
    }
    return alreadyUpdatedAlbum;
  });
  if (!isUpdated)
    state.updatedAlbums.push({
      ...updatedAlbumChangedFields,
      ...(newPath ? { newPath } : {}),
    });

  // loadedAlbums update
  const loadedAlbumsUpdated = state.allAlbums.map((album) =>
    album.path === updatedAlbumChangedFields.path
      ? {
          ...album,
          ...updatedAlbumChangedFields,
          ...(newPath ? { path: newPath } : {}),
        }
      : album
  );

  state.allAlbums = sortAlbums(loadedAlbumsUpdated);
  state.allFiles = sortFiles(state.allFiles, state.allAlbums);
};

export const addUpdatedFile = (updatedFile: UpdatedFile): void => {
  const currentFile = state.allFiles.find(
    (file) => file.filename === updatedFile.filename
  );
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

  let isUpdated = false;
  state.updatedFiles = state.updatedFiles.map((alreadyUpdatedFile) => {
    if (alreadyUpdatedFile.filename === updatedFileChangedFields.filename) {
      isUpdated = true;
      return { ...alreadyUpdatedFile, ...updatedFileChangedFields };
    }
    return alreadyUpdatedFile;
  });
  if (!isUpdated) state.updatedFiles.push(updatedFileChangedFields);

  // allFiles update
  const files = state.allFiles.map((file) =>
    file.filename === updatedFileChangedFields.filename
      ? {
          ...file,
          ...updatedFileChangedFields,
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

export const addAlbums = (allAlbums: AlbumInterface[], isReplace?: boolean) => {
  if (isReplace) {
    state.allAlbums = allAlbums;
    return;
  }

  allAlbums.forEach((album) => {
    if (state.allAlbums.every((stateAlbum) => stateAlbum.path !== album.path)) {
      state.allAlbums.push(album);
    }
  });
};

export const addFiles = (allFiles: FileInterface[], isReplace?: boolean) => {
  if (isReplace) {
    state.allFiles = allFiles;
    return;
  }

  state.allFiles.push(...allFiles);
};

export const updateLoadedMainPaths = (
  mainPath: string,
  isReplace?: boolean
) => {
  if (isReplace) {
    state.loadedMainPaths = [];
  }

  if (mainPath) {
    state.loadedMainPaths.push(mainPath);
  }

  if (!state.loadedMainPaths.includes('')) {
    state.loadedMainPaths.push('');
  }
};

export const setIsEverythingLoaded = () => {
  state.isEverythingLoaded = true;
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

export const getSelectedFiles = () => state.selectedFiles;

export const switchEditMode = (value?: boolean) => {
  state.isEditModeEnabled =
    value !== undefined ? value : !state.isEditModeEnabled;
};

export const getIsEditModeEnabled = () => state.isEditModeEnabled;

export const getMainPath = () => state.mainPath;
export const getByDate = () => state.byDate;

export const setMainPath = (mainPath: string) => {
  state.mainPath = mainPath;
};

export const setByDate = (byDate: boolean) => {
  state.byDate = byDate;
};

export const shouldLoad = () =>
  !state.isEverythingLoaded &&
  (!state.loadedMainPaths.includes(state.mainPath) ||
    (state.mainPath === '' && state.byDate));

export const getAllAlbums = () => state.allAlbums;

export const addSelectedFile = (filename: string) => {
  state.selectedFiles.push(filename);
};

export const removeSelectedFile = (filename?: string) => {
  state.selectedFiles = filename
    ? state.selectedFiles.filter((selectedFile) => selectedFile !== filename)
    : [];
};
