import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AddedAlbum,
  AlbumInterface,
  FileInterface,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../../types';
import { RootState } from '../store';
import { createAppAsyncThunk } from '../withTypes';
import { request } from '../../services/api/request';
import { sortAlbums, sortFiles } from '../../services/sort';
import { mapFilesDtoToFiles } from '../../services/api/mapFilesDtoToFiles';
import {
  getUpdatedAlbumChangedFields,
  getUpdatedFileChangedFields,
} from '../../services/utils';

type User = {
  email: string;
  accesses: string[];
  isEditAccess?: boolean;
};

export interface AllAlbumsAndFilesState {
  currentMainPath: string;
  isShowingByDate: boolean;
  isApiLoading: boolean;
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  loadedMainPaths: string[];
  isEverythingLoaded: boolean;
  user: User | null;

  isEditModeEnabled: boolean;
  selectedFiles: string[];
  editPayload: {
    remove: {
      albums: RemovedAlbum[];
      files: RemovedFile[];
    };
    add: {
      albums: AddedAlbum[];
    };
    update: {
      albums: UpdatedAlbum[];
      files: UpdatedFile[];
    };
  };
}

const initialState: AllAlbumsAndFilesState = {
  currentMainPath: '',
  isShowingByDate: false,
  isApiLoading: true,
  allAlbums: [] as AlbumInterface[],
  allFiles: [] as FileInterface[],
  loadedMainPaths: [] as string[],
  isEverythingLoaded: false,
  user: null as User | null,

  isEditModeEnabled: false,
  selectedFiles: [] as string[],
  editPayload: {
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
    setCurrentMainPath: (state, action: PayloadAction<string>) => {
      state.currentMainPath = action.payload.split('/')[0];
    },
    setIsShowingByDate: (state, action: PayloadAction<boolean>) => {
      state.isShowingByDate = action.payload;
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
    removeSelectedFile: (state, action: PayloadAction<string>) => {
      state.selectedFiles = state.selectedFiles.filter(
        (selectedFile) => selectedFile !== action.payload
      );
    },
    addRemovedAlbum: (state, action: PayloadAction<RemovedAlbum>) => {
      const removedAlbum = action.payload;
      state.editPayload.remove.albums.push(removedAlbum);

      state.allAlbums = state.allAlbums.filter(
        (album) => album.path !== removedAlbum.path
      );
    },
    addRemovedFile: (state, action: PayloadAction<RemovedFile>) => {
      const removedFile = action.payload;
      state.editPayload.remove.files.push(removedFile);

      state.allFiles = state.allFiles.filter(
        (file) => file.filename !== removedFile.filename
      );
    },
    addAddedAlbum: (state, action: PayloadAction<AddedAlbum>) => {
      const addedAlbum = action.payload;
      state.editPayload.add.albums.push(addedAlbum);

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
    },
    addUpdatedAlbum: (state, action: PayloadAction<UpdatedAlbum>) => {
      const updatedAlbum = action.payload;
      const currentAlbum = state.allAlbums.find(
        (album) => album.path === updatedAlbum.path
      );

      const { updatedAlbumChangedFields, newPath } =
        getUpdatedAlbumChangedFields(updatedAlbum, currentAlbum);

      let isUpdated = false;
      state.editPayload.update.albums = state.editPayload.update.albums.map(
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
        state.editPayload.update.albums.push({
          ...updatedAlbumChangedFields,
          ...(newPath ? { newPath } : {}),
        });

      // allAlbums update
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
    },
    addUpdatedFile: (state, action: PayloadAction<UpdatedFile>) => {
      const updatedFile = action.payload;
      const currentFile = state.allFiles.find(
        (file) => file.filename === updatedFile.filename
      );
      const { updatedFileChangedFields } = getUpdatedFileChangedFields(
        updatedFile,
        currentFile
      );

      let isUpdated = false;
      state.editPayload.update.files = state.editPayload.update.files.map(
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
      if (!isUpdated)
        state.editPayload.update.files.push(updatedFileChangedFields);

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
    },
    resetUpdated: (state) => {
      state.editPayload.remove.albums = [];
      state.editPayload.remove.files = [];
      state.editPayload.add.albums = [];
      state.editPayload.update.albums = [];
      state.editPayload.update.files = [];
      state.selectedFiles = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(apiLoad.pending, (state, action) => {
        state.isApiLoading = true;
      })
      .addCase(apiLoad.rejected, (state, action) => {
        state.isApiLoading = false;
      })
      .addCase(apiLoad.fulfilled, (state, action) => {
        state.isApiLoading = false;

        const { isReplace, isEverythingLoaded, albums, files, user } =
          action.payload;

        // user
        state.user = user;

        // loadedMainPaths
        if (isReplace) {
          state.loadedMainPaths = [];
        }

        if (state.loadedMainPaths.includes(state.currentMainPath)) {
          return;
        }

        if (state.currentMainPath) {
          state.loadedMainPaths.push(state.currentMainPath);
        }

        if (!state.loadedMainPaths.includes('')) {
          state.loadedMainPaths.push('');
        }

        if (isEverythingLoaded) {
          state.isEverythingLoaded = isEverythingLoaded;
        }

        // albums and files
        if (isReplace) {
          state.allAlbums = albums;
          state.allFiles = mapFilesDtoToFiles(files);
        } else {
          albums.forEach((album: any) => {
            if (
              state.allAlbums.every(
                (stateAlbum) => stateAlbum.path !== album.path
              )
            ) {
              state.allAlbums.push(album);
            }
          });

          state.allFiles.push(...mapFilesDtoToFiles(files));
        }
      })
      .addCase(apiLogin.fulfilled, (_state, action) => {
        const [isSuccess, csrf] = action.payload;

        if (isSuccess) {
          localStorage.setItem('csrf', csrf);
        }
      })
      .addCase(apiLogout.fulfilled, (_state, action) => {
        const isSuccess = action.payload;

        if (isSuccess) {
          localStorage.removeItem('csrf');
        }
      })
      .addCase(apiEdit.fulfilled, (state, action) => {
        const isSuccess = action.payload;

        if (isSuccess) {
          state.editPayload.remove.albums = [];
          state.editPayload.remove.files = [];
          state.editPayload.add.albums = [];
          state.editPayload.update.albums = [];
          state.editPayload.update.files = [];
          state.selectedFiles = [];
        }
      });
  },
});

export const apiLoad = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLoad',
  async (isReplace: boolean, { getState }) => {
    const {
      allAlbumsAndFiles: { isShowingByDate, currentMainPath, allAlbums },
    } = getState();

    const shouldLoadEverything = isShowingByDate && currentMainPath === '';

    const home = shouldLoadEverything
      ? ''
      : currentMainPath === ''
      ? 'only'
      : allAlbums.length === 0 || isReplace
      ? 'include'
      : '';

    const [responseJson] = await request(
      `/get/${currentMainPath ?? ''}${home ? `?home=${home}` : ''}`
    );

    return {
      isReplace: isReplace || shouldLoadEverything,
      isEverythingLoaded: shouldLoadEverything,
      albums: responseJson.albums,
      files: responseJson.files,
      user: responseJson.user,
    };
  }
);

export const apiLogin = createAppAsyncThunk(
  'allAlbumsAndFiles/apiLogin',
  async (googleToken: string) => {
    const [{ csrf }, status] = await request('/auth/login', 'POST', {
      token: googleToken,
    });

    return [status < 400, csrf];
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
      state.allAlbumsAndFiles.editPayload
    );

    return status < 400;
  }
);

export const {
  setCurrentMainPath,
  setIsShowingByDate,
  switchEditMode,
  addSelectedFile,
  removeSelectedFile,
  addRemovedAlbum,
  addRemovedFile,
  addAddedAlbum,
  addUpdatedAlbum,
  addUpdatedFile,
  resetUpdated,
} = albumsSlice.actions;

export default albumsSlice.reducer;

export const selectIsApiLoading = (state: RootState) =>
  state.allAlbumsAndFiles.isApiLoading;
export const selectAllAlbums = (state: RootState) =>
  state.allAlbumsAndFiles.allAlbums;
export const selectAllFiles = (state: RootState) =>
  state.allAlbumsAndFiles.allFiles;

export const selectShouldLoad = (state: RootState) => {
  const {
    allAlbumsAndFiles: {
      isEverythingLoaded,
      loadedMainPaths,
      currentMainPath,
      isShowingByDate,
    },
  } = state;

  return (
    !isEverythingLoaded &&
    (!loadedMainPaths.includes(currentMainPath) ||
      (currentMainPath === '' && isShowingByDate))
  );
};

export const selectUser = (state: RootState) => state.allAlbumsAndFiles.user;

export const selectIsEditModeEnabled = (state: RootState) =>
  state.allAlbumsAndFiles.isEditModeEnabled;
export const selectSelectedFiles = (state: RootState) =>
  state.allAlbumsAndFiles.selectedFiles;
export const selectRemovedAlbums = (state: RootState) =>
  state.allAlbumsAndFiles.editPayload.remove.albums;
export const selectRemovedFiles = (state: RootState) =>
  state.allAlbumsAndFiles.editPayload.remove.files;
export const selectAddedAlbums = (state: RootState) =>
  state.allAlbumsAndFiles.editPayload.add.albums;
export const selectUpdatedAlbums = (state: RootState) =>
  state.allAlbumsAndFiles.editPayload.update.albums;
export const selectUpdatedFiles = (state: RootState) =>
  state.allAlbumsAndFiles.editPayload.update.files;
