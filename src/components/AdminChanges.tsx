import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  resetUpdated,
  apiEdit,
  apiLoad,
  selectSelectedFiles,
  selectChanges,
  selectIsEditModeEnabled,
  resolve,
} from '../app/stateSlices/allAlbumsAndFilesSlice';

export const AdminChanges = () => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector(selectSelectedFiles);
  const {
    remove: { albums: removedAlbums, files: removedFiles },
    add: { albums: addedAlbums },
    update: { albums: updatedAlbums, files: updatedFiles },
  } = useAppSelector(selectChanges);

  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);

  const areChanges =
    removedAlbums.length > 0 ||
    removedFiles.length > 0 ||
    addedAlbums.length > 0 ||
    updatedAlbums.length > 0 ||
    updatedFiles.length > 0 ||
    selectedFiles.length > 0;

  return (
    <>
      {selectedFiles.length > 0 && (
        <div>{`Selected Files: ${selectedFiles}`}</div>
      )}

      {removedAlbums.map((album) => (
        <div key={album.path}>{`Album REMOVE: ${JSON.stringify(album)}`}</div>
      ))}
      {removedFiles.map((file) => (
        <div key={file.filename}>{`File REMOVE: ${JSON.stringify(file)}`}</div>
      ))}
      {addedAlbums.map((album) => (
        <div key={album.path}>{`Album ADD: ${JSON.stringify(album)}`}</div>
      ))}
      {updatedAlbums.map((album) => (
        <div key={album.path}>{`Album UPDATE: ${JSON.stringify(album)}`}</div>
      ))}
      {updatedFiles.map((file) => (
        <div key={file.filename}>{`File UPDATE: ${JSON.stringify(file)}`}</div>
      ))}

      {isEditModeEnabled && (
        <>
          <button
            onClick={async () => {
              await dispatch(apiEdit());
              await dispatch(apiLoad(true));
            }}
          >
            {areChanges
              ? 'save changes, and invalidate memory cache'
              : 'invalidate memory cache'}
          </button>

          <button
            onClick={async () => {
              await dispatch(resolve());
              await dispatch(apiLoad(true));
              alert('Done');
            }}
          >
            resolve (cached storage paths)
          </button>

          {areChanges && (
            <button
              onClick={async () => {
                dispatch(resetUpdated());
              }}
            >
              cancel changes
            </button>
          )}
        </>
      )}
    </>
  );
};
