import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AddedAlbum,
  AlbumDTO,
  AlbumInterface,
  Changes,
  FileDTO,
  FileInterface,
  NewAlbumPath,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../../types';
import type { RootState } from '../store';
import { createAppAsyncThunk } from '../withTypes';
import { request } from '../../services/api/request';
import { mapFilesDtoToFiles } from '../../services/api/mapFilesDtoToFiles';
import {
  convertDateRangesToParameterString,
  getPathWithDateRangesAndTags,
  getUpdatedAlbumChangedFields,
  getUpdatedFileChangedFields,
  uniqueAlbums,
  uniqueFiles,
} from '../../services/utils';
import { sortAlbums, sortFiles } from '../../services/sort';
import { PARAMETER_DATE_RANGES, PARAMETER_TAGS } from '../../constants';

type User = {
  email: string;
  accesses: string[];
  isEditAccess?: boolean;
};

interface AllAlbumsAndFilesState {
  currentPath: string;
  dateRanges?: string[][];
  tags?: string[];
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
  tags: undefined,
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
        tags?: string[];
        token: string;
      }>,
    ) => {
      state.currentPath = action.payload.currentPath;
      state.dateRanges = action.payload.dateRanges;
      state.tags = action.payload.tags;

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
      } catch {
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
          (selectedFile) => selectedFile !== action.payload,
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
        (album) => album.path === updatedAlbum.path,
      );

      if (!currentAlbum) {
        alert('error updating the album!');
        return;
      }

      const { updatedAlbumChangedFields, newPath } =
        getUpdatedAlbumChangedFields(updatedAlbum, currentAlbum);

      let isUpdated = false;
      state.changes.add.albums = state.changes.add.albums.map((addedAlbum) => {
        if (addedAlbum.path === updatedAlbumChangedFields.path) {
          isUpdated = true;
          return {
            ...addedAlbum,
            ...updatedAlbumChangedFields,
            ...(newPath ? { path: newPath } : {}),
          };
        }
        return addedAlbum;
      });
      if (isUpdated) return;

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
        },
      );
      if (isUpdated) return;

      state.changes.update.albums.push({
        ...updatedAlbumChangedFields,
        ...(newPath ? { newPath } : {}),
      });
    },
    newAlbumPath: (state, action: PayloadAction<NewAlbumPath>) => {
      const { path, newPath } = action.payload;

      const updatedAlbums = state.allAlbums
        .filter(
          (album) => album.path === path || album.path.startsWith(`${path}/`),
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
            (album) => (album.newPath || album.path) === updatedAlbum.path,
          );

          updatedAlbumsNew.push(
            alreadyUpdatedAlbum
              ? { ...alreadyUpdatedAlbum, ...updatedAlbum }
              : updatedAlbum,
          );
        },
      );
      state.changes.update.albums = updatedAlbumsNew;

      const updatedFiles = state.allFiles
        .filter((file) => {
          const filePath = file.resolved?.path ?? file.path ?? 'NOT RESOLVED';

          return filePath === path || filePath.startsWith(`${path}/`);
        })
        .map((file) => {
          const filePath = file.resolved?.path ?? file.path ?? 'NOT RESOLVED';

          return {
            filename: file.filename,
            path:
              filePath === path
                ? newPath
                : filePath.replace(`${path}/`, `${newPath}/`),
          };
        });

      const updatedFilesNew: UpdatedFile[] = [];
      [...state.changes.update.files, ...updatedFiles].forEach(
        (updatedFile) => {
          const alreadyUpdatedFile = state.changes.update.files.find(
            (file) => file.filename === updatedFile.filename,
          );

          updatedFilesNew.push(
            alreadyUpdatedFile
              ? { ...alreadyUpdatedFile, ...updatedFile }
              : updatedFile,
          );
        },
      );
      state.changes.update.files = updatedFilesNew;
    },
    addUpdatedFile: (state, action: PayloadAction<UpdatedFile>) => {
      const updatedFile = action.payload;

      const currentFile = state.allFiles.find(
        (file) => file.filename === updatedFile.filename,
      );

      if (!currentFile) {
        alert('error updating the file!');
        return;
      }

      const updatedFileChangedFields = getUpdatedFileChangedFields(
        updatedFile,
        currentFile,
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
        },
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

        const { isReplace, albums, files, user } = action.payload;

        state.user = user;

        if (isReplace) {
          state.loadedPaths = [];
          state.allAlbums = [];
          state.allFiles = [];
        }

        const pathWithDateRanges = getPathWithDateRangesAndTags(
          state.currentPath,
          state.dateRanges,
          state.tags,
        );

        if (state.loadedPaths.includes(pathWithDateRanges)) {
          return;
        }

        state.loadedPaths.push(pathWithDateRanges);

        state.allFiles = sortFiles(
          uniqueFiles(state.allFiles, mapFilesDtoToFiles(files)),
        );
        state.allAlbums = sortAlbums(uniqueAlbums(state.allAlbums, albums));
      })
      .addCase(apiLogin.pending, (state) => {
        state.isApiLogining = true;
      })
      .addCase(apiLogin.rejected, (state) => {
        state.isApiLogining = false;
      })
      .addCase(apiLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isApiLogining = false;
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

        localStorage.removeItem('access_token');
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
      allAlbumsAndFiles: { dateRanges, tags, currentPath, token },
    } = getState();

    const params = [
      { name: 'token', value: token },
      {
        name: PARAMETER_DATE_RANGES,
        value: convertDateRangesToParameterString(dateRanges ?? []),
      },
      {
        name: PARAMETER_TAGS,
        value: tags?.join(','),
      },
    ]
      .filter((param) => Boolean(param.value))
      .map((param) => `${param.name}=${param.value}`)
      .join('&');

    const responseJson = await request(
      `/get/${currentPath ?? ''}${params ? `?${params}` : ''}`,
    );

    return {
      isReplace,
      albums: (responseJson?.albums ?? []) as AlbumDTO[],
      files: (responseJson?.files ?? []) as FileDTO[],
      user: responseJson?.user ?? null,
    };
  },
);

export const apiLogin = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLogin',
  async (googleToken: string) => {
    const responseJson = await request('/auth/login', 'POST', {
      token: googleToken,
    });

    return responseJson?.user ?? null;
  },
);

export const apiLogout = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLogout',
  async () => {
    const responseJson = await request('/auth/logout', 'POST');

    return Boolean(responseJson);
  },
);

export const apiEdit = createAppAsyncThunk(
  'allAlbumsAndFiles/apiEdit',
  async (_payload, { getState }) => {
    const state = getState();

    const responseJson = await request(
      '/edit',
      'POST',
      state.allAlbumsAndFiles.changes,
    );

    return Boolean(responseJson);
  },
);

export const resolve = createAppAsyncThunk(
  'allAlbumsAndFiles/resolve',
  async () => {
    const responseJson = await request('/resolve', 'POST');

    return Boolean(responseJson);
  },
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
