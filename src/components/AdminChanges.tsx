import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectRemovedAlbums,
  selectRemovedFiles,
  selectAddedAlbums,
  selectUpdatedAlbums,
  selectUpdatedFiles,
  resetUpdated,
  apiEdit,
  apiLoad,
  selectSelectedFiles,
} from '../app/stateSlices/allAlbumsAndFilesSlice';

export const AdminChanges = () => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector(selectSelectedFiles);
  const removedAlbums = useAppSelector(selectRemovedAlbums);
  const removedFiles = useAppSelector(selectRemovedFiles);
  const addedAlbums = useAppSelector(selectAddedAlbums);
  const updatedAlbums = useAppSelector(selectUpdatedAlbums);
  const updatedFiles = useAppSelector(selectUpdatedFiles);

  return (
    <>
      {selectedFiles.length > 0 && (
        <div>{`Selected Files: ${selectedFiles}`}</div>
      )}

      {removedAlbums.map((album) => (
        <div>{`Album REMOVE: ${JSON.stringify(album)}`}</div>
      ))}
      {removedFiles.map((file) => (
        <div>{`File REMOVE: ${JSON.stringify(file)}`}</div>
      ))}
      {addedAlbums.map((album) => (
        <div>{`Album ADD: ${JSON.stringify(album)}`}</div>
      ))}
      {updatedAlbums.map((album) => (
        <div>{`Album UPDATE: ${JSON.stringify(album)}`}</div>
      ))}
      {updatedFiles.map((file) => (
        <div>{`File UPDATE: ${JSON.stringify(file)}`}</div>
      ))}

      {removedAlbums.length > 0 ||
        removedFiles.length > 0 ||
        addedAlbums.length > 0 ||
        updatedAlbums.length > 0 ||
        updatedFiles.length > 0 ||
        (selectedFiles.length > 0 && (
          <>
            <button
              onClick={async () => {
                await dispatch(apiEdit());
                await dispatch(apiLoad(true));
              }}
            >
              save changes
            </button>
            <button
              onClick={async () => {
                dispatch(resetUpdated());
                await dispatch(apiLoad(true));
              }}
            >
              cancel changes
            </button>
          </>
        ))}
    </>
  );
};
