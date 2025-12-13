import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  resetUpdated,
  apiEdit,
  apiLoad,
  selectSelectedFiles,
  selectChanges,
} from '../app/stateSlices/allAlbumsAndFilesSlice';

export const AdminChanges = () => {
  const dispatch = useAppDispatch();

  const selectedFiles = useAppSelector(selectSelectedFiles);
  const {
    remove: { albums: removedAlbums, files: removedFiles },
    add: { albums: addedAlbums },
    update: { albums: updatedAlbums, files: updatedFiles },
  } = useAppSelector(selectChanges);

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

      {(removedAlbums.length > 0 ||
        removedFiles.length > 0 ||
        addedAlbums.length > 0 ||
        updatedAlbums.length > 0 ||
        updatedFiles.length > 0 ||
        selectedFiles.length > 0) && (
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
            }}
          >
            cancel changes
          </button>
        </>
      )}
    </>
  );
};
