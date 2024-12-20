import {
  state,
  addAlbums,
  addFiles,
  setUser,
  getUpdated,
  resetUpdated,
  updateLoadedMainPaths,
  getMainPath,
  getByDate,
  setIsEverythingLoaded,
} from '../../state';
import { mapFilesDtoToFiles } from './files-mapper';
import { request } from './request';

export const apiLoad = async (isReplace?: boolean): Promise<void> => {
  const mainPath = getMainPath();
  const shouldLoadEverything = getByDate() && mainPath === '';

  updateLoadedMainPaths(mainPath, isReplace);
  if (shouldLoadEverything) {
    setIsEverythingLoaded();
  }

  const home = shouldLoadEverything
    ? ''
    : mainPath === ''
    ? 'only'
    : state.allAlbums.length === 0 || isReplace
    ? 'include'
    : '';

  const [responseJson] = await request(
    `/get/${mainPath ?? ''}${home ? `?home=${home}` : ''}`
  );

  addAlbums(responseJson.albums, isReplace || shouldLoadEverything);
  addFiles(
    mapFilesDtoToFiles(responseJson.files),
    isReplace || shouldLoadEverything
  );

  setUser(responseJson.user);
};

export const apiLogin = async (googleToken: string): Promise<boolean> => {
  const [{ csrf }, status] = await request('/auth/login', 'POST', {
    token: googleToken,
  });

  localStorage.setItem('csrf', csrf);

  return status < 400;
};

export const apiLogout = async (): Promise<boolean> => {
  const [, status] = await request('/auth/logout', 'POST');

  if (status < 400) {
    localStorage.removeItem('csrf');
    setUser(null);
    return true;
  }

  return false;
};

export const apiEdit = async (): Promise<boolean> => {
  const updated = getUpdated();

  const [, status] = await request('/edit', 'POST', {
    remove: {
      albums: updated.removedAlbums,
      files: updated.removedFiles,
    },
    add: {
      albums: updated.addedAlbums,
    },
    update: {
      albums: updated.updatedAlbums,
      files: updated.updatedFiles,
    },
  });

  if (status < 400) {
    resetUpdated();

    return true;
  }

  return false;
};
