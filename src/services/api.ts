import { API_URL, IS_LOCAL_DEVELOPMENT } from '../constants';
import {
  AddedAlbum,
  AddedFile,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import {
  addAlbumLoaded,
  getAlbums,
  removeAlbumLoaded,
  updateAlbumLoaded,
} from './albums';
import { addFileLoaded, removeFileLoaded, updateFileLoaded } from './files';

const state = {
  email: null as string | null,
  removedAlbums: [] as RemovedAlbum[],
  removedFiles: [] as RemovedFile[],
  addedAlbums: [] as AddedAlbum[],
  addedFiles: [] as AddedFile[],
  updatedAlbums: [] as UpdatedAlbum[],
  updatedFiles: [] as UpdatedFile[],
};

export const apiLogin = async (googleToken?: string): Promise<boolean> => {
  if (!googleToken) return false;

  if (IS_LOCAL_DEVELOPMENT) {
    state.email = 'test@email.com';
    return true;
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: googleToken }),
    credentials: 'include',
  });

  const { user, csrf } = await response.json();
  localStorage.setItem('csrf', csrf);

  state.email = user && user.email;

  return response.status < 400;
};

export const apiSend = async (): Promise<boolean> => {
  if (IS_LOCAL_DEVELOPMENT) {
    console.log(state);

    state.removedAlbums = [];
    state.removedFiles = [];
    state.addedAlbums = [];
    state.addedFiles = [];
    state.updatedAlbums = [];
    state.updatedFiles = [];

    return true;
  }

  const response = await fetch(`${API_URL}/gallery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('csrf') || '',
    },
    body: JSON.stringify({
      remove: {
        albums: state.removedAlbums,
        files: state.removedFiles,
      },
      add: {
        albums: state.addedAlbums,
        files: state.addedFiles,
      },
      update: {
        albums: state.updatedAlbums,
        files: state.updatedFiles,
      },
    }),
    credentials: 'include',
  });

  if (response.status < 400) {
    state.removedAlbums = [];
    state.removedFiles = [];
    state.addedAlbums = [];
    state.addedFiles = [];
    state.updatedAlbums = [];
    state.updatedFiles = [];

    return true;
  }

  return false;
};

export const apiMediaUrlsUpdater = async (): Promise<boolean> => {
  const response = await fetch(`${API_URL}/gallery/media-urls-updater`, {
    method: 'POST',
    headers: {
      Authorization: localStorage.getItem('csrf') || '',
    },
    credentials: 'include',
  });

  return response.status < 400;
};

export const addAddedAlbum = (addedAlbum: AddedAlbum): void => {
  state.addedAlbums.push(addedAlbum);

  addAlbumLoaded(addedAlbum);
};

export const addAddedFile = async (addedFile: AddedFile): Promise<void> => {
  state.addedFiles.push(addedFile);

  addFileLoaded(addedFile, await getAlbums(''));
};

export const addUpdatedAlbum = (updatedAlbum: UpdatedAlbum): void => {
  let isUpdated = false;
  state.updatedAlbums = state.updatedAlbums.map((alreadyUpdatedAlbum) => {
    if (alreadyUpdatedAlbum.newPath === updatedAlbum.path) {
      isUpdated = true;
      return updatedAlbum;
    }
    return alreadyUpdatedAlbum;
  });
  if (!isUpdated) state.updatedAlbums.push(updatedAlbum);

  updateAlbumLoaded(updatedAlbum);
};

export const addUpdatedFile = async (
  updatedFile: UpdatedFile
): Promise<void> => {
  let isUpdated = false;
  state.updatedFiles = state.updatedFiles.map((alreadyUpdatedFile) => {
    if (alreadyUpdatedFile.filename === updatedFile.filename) {
      isUpdated = true;
      return updatedFile;
    }
    return alreadyUpdatedFile;
  });
  if (!isUpdated) state.updatedFiles.push(updatedFile);

  updateFileLoaded(updatedFile, await getAlbums(''));
};

export const addRemovedAlbum = (removedAlbum: RemovedAlbum): void => {
  state.removedAlbums.push(removedAlbum);

  removeAlbumLoaded(removedAlbum);
};

export const addRemovedFile = (removedFile: RemovedFile): void => {
  state.removedFiles.push(removedFile);

  removeFileLoaded(removedFile);
};

export const isLoggedIn = () => state.email !== null;

export const getUpdated = () => ({
  removedAlbums: state.removedAlbums,
  removedFiles: state.removedFiles,
  addedAlbums: state.addedAlbums,
  addedFiles: state.addedFiles,
  updatedAlbums: state.updatedAlbums,
  updatedFiles: state.updatedFiles,
});
