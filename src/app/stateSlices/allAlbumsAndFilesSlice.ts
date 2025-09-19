import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AddedAlbum,
  AlbumInterface,
  Changes,
  FileInterface,
  NewAlbumPath,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../../types';
import { RootState } from '../store';
import { createAppAsyncThunk } from '../withTypes';
import { request } from '../../services/api/request';
import { mapFilesDtoToFiles } from '../../services/api/mapFilesDtoToFiles';
import {
  convertDateRangesToParameterString,
  getPathWithDateRanges,
  getUpdatedAlbumChangedFields,
  getUpdatedFileChangedFields,
  uniqueAlbums,
  uniqueFiles,
} from '../../services/utils';
import { checkIsCookieRestrictedBrowser } from '../../services/checkIsCookieRestrictedBrowser';

type User = {
  email: string;
  accesses: string[];
  isEditAccess?: boolean;
};

interface AllAlbumsAndFilesState {
  currentPath: string;
  dateRanges?: string[][];
  token: string;
  tokenExpiresAt: number;
  isApiLoading: boolean;
  isApiLogining: boolean;
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  loadedPaths: string[];
  user: User | null;

  isEditModeEnabled: boolean;
  selectedFiles: string[];
  changes: Changes;
}

const initialState: AllAlbumsAndFilesState = {
  currentPath: '',
  dateRanges: undefined,
  token: '',
  tokenExpiresAt: 0,
  isApiLoading: false,
  isApiLogining: true,
  allAlbums: [] as AlbumInterface[],
  allFiles: [] as FileInterface[],
  loadedPaths: [] as string[],
  user: null as User | null,

  isEditModeEnabled: false,
  selectedFiles: [] as string[],
  changes: {
    remove: {
      albums: [] as RemovedAlbum[],
      files: [] as RemovedFile[],
    },
    add: {
      albums: [] as AddedAlbum[],
    },
    update: {
      albums: [] as UpdatedAlbum[],
      files: [] as UpdatedFile[],
    },
  },
};

const albumsSlice = createSlice({
  name: 'allAlbumsAndFiles',
  initialState,
  reducers: {
    setShowingProperties: (
      state,
      action: PayloadAction<{
        currentPath: string;
        dateRanges?: string[][];
        token: string;
      }>
    ) => {
      state.currentPath = action.payload.currentPath;
      state.dateRanges = action.payload.dateRanges;

      const token = action.payload.token;

      if (!token) {
        state.token = token;
        state.tokenExpiresAt = 0;
        return;
      }

      const [, payloadBase64] = token.split('.');

      try {
        const payload = JSON.parse(atob(payloadBase64));

        state.token = token;
        state.tokenExpiresAt = payload.exp * 1000;
      } catch (error) {
        console.error(`Invalid token: ${token}`);
      }
    },
    switchEditMode: (state, action: PayloadAction<boolean | undefined>) => {
      state.isEditModeEnabled =
        action.payload !== undefined
          ? action.payload
          : !state.isEditModeEnabled;
    },
    addSelectedFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles.push(action.payload);
    },
    removeSelectedFile: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.selectedFiles = state.selectedFiles.filter(
          (selectedFile) => selectedFile !== action.payload
        );
      } else {
        state.selectedFiles = [];
      }
    },
    addRemovedAlbum: (state, action: PayloadAction<RemovedAlbum>) => {
      const removedAlbum = action.payload;
      state.changes.remove.albums.push(removedAlbum);
    },
    addRemovedFile: (state, action: PayloadAction<RemovedFile>) => {
      const removedFile = action.payload;
      state.changes.remove.files.push(removedFile);
    },
    addAddedAlbum: (state, action: PayloadAction<AddedAlbum>) => {
      const addedAlbum = action.payload;
      state.changes.add.albums.push(addedAlbum);
    },
    addUpdatedAlbum: (state, action: PayloadAction<UpdatedAlbum>) => {
      const updatedAlbum = action.payload;
      const currentAlbum = state.allAlbums.find(
        (album) => album.path === updatedAlbum.path
      );

      if (!currentAlbum) {
        alert('error updating the album!');
        return;
      }

      const { updatedAlbumChangedFields, newPath } =
        getUpdatedAlbumChangedFields(updatedAlbum, currentAlbum);

      let isUpdated = false;
      state.changes.update.albums = state.changes.update.albums.map(
        (alreadyUpdatedAlbum) => {
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
        }
      );

      if (!isUpdated)
        state.changes.update.albums.push({
          ...updatedAlbumChangedFields,
          ...(newPath ? { newPath } : {}),
        });
    },
    newAlbumPath: (state, action: PayloadAction<NewAlbumPath>) => {
      const { path, newPath } = action.payload;

      const updatedAlbums = state.allAlbums
        .filter(
          (album) => album.path === path || album.path.startsWith(`${path}/`)
        )
        .map((album) => ({
          path: album.path,
          newPath:
            album.path === path
              ? newPath
              : album.path.replace(`${path}/`, `${newPath}/`),
        }));

      const updatedAlbumsNew: UpdatedAlbum[] = [];
      [...state.changes.update.albums, ...updatedAlbums].forEach(
        (updatedAlbum) => {
          const alreadyUpdatedAlbum = state.changes.update.albums.find(
            (album) => (album.newPath || album.path) === updatedAlbum.path
          );

          updatedAlbumsNew.push(
            alreadyUpdatedAlbum
              ? { ...alreadyUpdatedAlbum, ...updatedAlbum }
              : updatedAlbum
          );
        }
      );
      state.changes.update.albums = updatedAlbumsNew;

      const updatedFiles = state.allFiles
        .filter(
          (file) => file.path === path || file.path.startsWith(`${path}/`)
        )
        .map((file) => ({
          filename: file.filename,
          path:
            file.path === path
              ? newPath
              : file.path.replace(`${path}/`, `${newPath}/`),
        }));

      const updatedFilesNew: UpdatedFile[] = [];
      [...state.changes.update.files, ...updatedFiles].forEach(
        (updatedFile) => {
          const alreadyUpdatedFile = state.changes.update.files.find(
            (file) => file.filename === updatedFile.filename
          );

          updatedFilesNew.push(
            alreadyUpdatedFile
              ? { ...alreadyUpdatedFile, ...updatedFile }
              : updatedFile
          );
        }
      );
      state.changes.update.files = updatedFilesNew;
    },
    addUpdatedFile: (state, action: PayloadAction<UpdatedFile>) => {
      const updatedFile = action.payload;
      const currentFile = state.allFiles.find(
        (file) => file.filename === updatedFile.filename
      );

      if (!currentFile) {
        alert('error updating the file!');
        return;
      }

      const { updatedFileChangedFields } = getUpdatedFileChangedFields(
        updatedFile,
        currentFile
      );

      let isUpdated = false;
      state.changes.update.files = state.changes.update.files.map(
        (alreadyUpdatedFile) => {
          if (
            alreadyUpdatedFile.filename === updatedFileChangedFields.filename
          ) {
            isUpdated = true;
            return { ...alreadyUpdatedFile, ...updatedFileChangedFields };
          }
          return alreadyUpdatedFile;
        }
      );

      if (!isUpdated) state.changes.update.files.push(updatedFileChangedFields);
    },
    resetUpdated: (state) => {
      state.changes.remove.albums = [];
      state.changes.remove.files = [];
      state.changes.add.albums = [];
      state.changes.update.albums = [];
      state.changes.update.files = [];
      state.selectedFiles = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(apiLoad.pending, (state) => {
        state.isApiLoading = true;
      })
      .addCase(apiLoad.rejected, (state) => {
        state.isApiLoading = false;
        state.isApiLogining = false;
      })
      .addCase(apiLoad.fulfilled, (state, action) => {
        state.isApiLoading = false;
        state.isApiLogining = false;

        const { isReplace, albums, files, user, accessToken } = action.payload;

        if (
          accessToken &&
          checkIsCookieRestrictedBrowser(navigator.userAgent)
        ) {
          localStorage.setItem('access_token', accessToken);
        }

        state.user = user;

        if (isReplace) {
          state.loadedPaths = [];
          state.allAlbums = [];
          state.allFiles = [];
        }

        const pathWithDateRanges = getPathWithDateRanges(
          state.currentPath,
          state.dateRanges
        );

        if (state.loadedPaths.includes(pathWithDateRanges)) {
          return;
        }

        if (!state.loadedPaths.includes('')) {
          state.loadedPaths.push('');
        }

        if (pathWithDateRanges) {
          state.loadedPaths.push(pathWithDateRanges);
        }

        state.allAlbums = uniqueAlbums(state.allAlbums, albums);
        state.allFiles = uniqueFiles(
          state.allFiles,
          mapFilesDtoToFiles(files)
        ).sort((f1, f2) => f1.filename.localeCompare(f2.filename));
      })
      .addCase(apiLogin.pending, (state) => {
        state.isApiLogining = true;
      })
      .addCase(apiLogin.rejected, (state) => {
        state.isApiLogining = false;
      })
      .addCase(apiLogin.fulfilled, (state, action) => {
        const [isSuccess, csrf, user, accessToken] = action.payload;

        state.user = user;
        state.isApiLogining = false;

        if (!isSuccess) return;

        if (checkIsCookieRestrictedBrowser(navigator.userAgent)) {
          localStorage.setItem('access_token', accessToken);
        } else {
          localStorage.setItem('csrf', csrf);
        }
      })
      .addCase(apiLogout.pending, (state) => {
        state.isApiLogining = true;
      })
      .addCase(apiLogout.rejected, (state) => {
        state.isApiLogining = false;
      })
      .addCase(apiLogout.fulfilled, (state, action) => {
        state.user = null;
        state.isApiLogining = false;

        const isSuccess = action.payload;

        if (!isSuccess) return;

        localStorage.removeItem(
          checkIsCookieRestrictedBrowser(navigator.userAgent)
            ? 'access_token'
            : 'csrf'
        );
      })
      .addCase(apiEdit.fulfilled, (state, action) => {
        const isSuccess = action.payload;

        if (isSuccess) {
          state.changes.remove.albums = [];
          state.changes.remove.files = [];
          state.changes.add.albums = [];
          state.changes.update.albums = [];
          state.changes.update.files = [];
          state.selectedFiles = [];
        }
      });
  },
});

export const apiLoad = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLoad',
  async (isReplace: boolean, { getState }) => {
    const {
      allAlbumsAndFiles: { dateRanges, currentPath, allAlbums, token },
    } = getState();

    const home =
      Boolean(dateRanges) && currentPath === ''
        ? ''
        : currentPath === ''
        ? 'only'
        : allAlbums.length === 0 || isReplace
        ? 'include'
        : '';

    const params = [
      { name: 'home', value: home },
      { name: 'token', value: token },
      {
        name: 'date-ranges',
        value: convertDateRangesToParameterString(dateRanges || []),
      },
    ]
      .filter((param) => Boolean(param.value))
      .map((param) => `${param.name}=${param.value}`)
      .join('&');

    const [responseJson] = await request(
      `/get/${currentPath ?? ''}${params ? `?${params}` : ''}`
    );

    return {
      isReplace,
      albums: responseJson.albums,
      files: responseJson.files,
      user: responseJson.user,
      accessToken: responseJson.accessToken,
    };
  }
);

export const apiLogin = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLogin',
  async (googleToken: string) => {
    const [{ csrf, user, accessToken }, status] = await request(
      '/auth/login',
      'POST',
      {
        token: googleToken,
      }
    );

    return [status < 400, csrf, user, accessToken];
  }
);

export const apiLogout = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLogout',
  async () => {
    const [, status] = await request('/auth/logout', 'POST');

    return status < 400;
  }
);

export const apiEdit = createAppAsyncThunk(
  'allAlbumsAndFiles/apiEdit',
  async (_payload, { getState }) => {
    const state = getState();

    const [, status] = await request(
      '/edit',
      'POST',
      state.allAlbumsAndFiles.changes
    );

    return status < 400;
  }
);

export const {
  setShowingProperties,
  switchEditMode,
  addSelectedFile,
  removeSelectedFile,
  addRemovedAlbum,
  addRemovedFile,
  addAddedAlbum,
  addUpdatedAlbum,
  newAlbumPath,
  addUpdatedFile,
  resetUpdated,
} = albumsSlice.actions;

export default albumsSlice.reducer;

export const selectIsApiLoading = (state: RootState) =>
  state.allAlbumsAndFiles.isApiLoading;
export const selectIsApiLogining = (state: RootState) =>
  state.allAlbumsAndFiles.isApiLogining;
export const selectAllAlbums = (state: RootState) =>
  state.allAlbumsAndFiles.allAlbums;
export const selectAllFiles = (state: RootState) =>
  state.allAlbumsAndFiles.allFiles;

export const selectLoadedPaths = (state: RootState) =>
  state.allAlbumsAndFiles.loadedPaths;

export const selectUser = (state: RootState) => state.allAlbumsAndFiles.user;
export const selectTokenExpiresAt = (state: RootState) =>
  state.allAlbumsAndFiles.tokenExpiresAt;

export const selectIsEditModeEnabled = (state: RootState) =>
  state.allAlbumsAndFiles.isEditModeEnabled;
export const selectSelectedFiles = (state: RootState) =>
  state.allAlbumsAndFiles.selectedFiles;
export const selectChanges = (state: RootState) =>
  state.allAlbumsAndFiles.changes;
