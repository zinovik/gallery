import React, { useContext } from 'react';
import { getUpdated, resetUpdated } from '../state';
import { apiEdit, apiLoad } from '../services/api';
import { ForceUpdateContext } from '../routers/MainRouter';

export const AdminUpdated = () => {
  const forceUpdate = useContext(ForceUpdateContext);

  const {
    removedAlbums,
    removedFiles,
    addedAlbums,
    updatedAlbums,
    updatedFiles,
  } = getUpdated();

  const update = async (isSuccess: boolean) => {
    await apiLoad(true);
    alert(isSuccess ? 'success' : 'error');
    forceUpdate();
  };

  return (
    <>
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
      {(removedAlbums.length !== 0 ||
        removedFiles.length !== 0 ||
        addedAlbums.length !== 0 ||
        updatedAlbums.length !== 0 ||
        updatedFiles.length !== 0) && (
        <>
          <button
            onClick={async () => {
              const isSuccess = await apiEdit();
              await update(isSuccess);
            }}
          >
            save changes
          </button>
          <button
            onClick={async () => {
              resetUpdated();
              await update(true);
            }}
          >
            cancel changes
          </button>
        </>
      )}
    </>
  );
};
