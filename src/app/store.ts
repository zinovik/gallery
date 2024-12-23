import { configureStore } from '@reduxjs/toolkit';
import allAlbumsAndFilesReducer from './stateSlices/allAlbumsAndFilesSlice';

export const store = configureStore({
  reducer: { allAlbumsAndFiles: allAlbumsAndFilesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
