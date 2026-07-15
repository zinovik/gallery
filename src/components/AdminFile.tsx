import type { FileInterface } from '../types';
import { useAppSelector } from '../app/hooks';
import {
  addRemovedFile,
  addSelectedFile,
  addUpdatedFile,
  removeSelectedFile,
  selectIsEditModeEnabled,
  selectSelectedFiles,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useDispatch } from 'react-redux';
import { AdminAccesses } from './AdminAccesses';

interface Props {
  file: FileInterface;
}

export const AdminFile = ({ file }: Props) => {
  const { description, text } = file;

  const dispatch = useDispatch();

  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);
  const selectedFiles = useAppSelector(selectSelectedFiles);

  if (!isEditModeEnabled) {
    return null;
  }

  return (
    <>
      {' '}
      <input
        type="checkbox"
        style={{ transform: 'scale(2)', margin: '10px', cursor: 'pointer' }}
        checked={selectedFiles.includes(file.filename)}
        onChange={(e) => {
          if (e.target.checked) {
            dispatch(addSelectedFile(file.filename));
          } else {
            dispatch(removeSelectedFile(file.filename));
          }
        }}
      />
      <button
        onClick={async () => {
          const filePath = file.path ?? file.resolved?.path ?? 'NOT RESOLVED';

          const newPath = prompt('path', filePath);
          if (newPath === null) return;
          const newDescription = prompt('description', description ?? '');
          if (newDescription === null) return;
          const oldTextString =
            (Array.isArray(text) ? text.join('---') : text) ?? '';
          const newTextString = prompt('text', oldTextString);
          if (newTextString === null) return;
          const oldTagsString = file.tags ? file.tags.join(',') : '';
          const newTagsString = prompt('tags', oldTagsString);
          if (newTagsString === null) return;
          const oldAccessesString = file.accesses
            ? file.accesses.join(',')
            : '';
          const newAccessesString = prompt('accesses', oldAccessesString);
          if (newAccessesString === null) return;

          if (
            newPath === filePath &&
            newDescription === (description ?? '') &&
            newTextString === oldTextString &&
            newTagsString === oldTagsString &&
            newAccessesString === oldAccessesString &&
            selectedFiles.length === 0
          )
            return;

          const filenames =
            selectedFiles.length > 0 ? selectedFiles : [file.filename];

          filenames.forEach((filename) =>
            dispatch(
              addUpdatedFile({
                filename: filename,
                path: newPath,
                description: newDescription,
                text: newTextString.includes('---')
                  ? newTextString.split('---')
                  : newTextString,
                tags: newTagsString.split(',').filter(Boolean),
                accesses: newAccessesString.split(',').filter(Boolean),
              }),
            ),
          );

          dispatch(removeSelectedFile());
        }}
      >
        {selectedFiles.length > 0 ? 'edit selected files' : 'edit file'}
      </button>
      {selectedFiles.length > 0 && (
        <button
          onClick={async () => {
            const newPath = prompt('path', file.path);
            if (newPath === null) return;

            selectedFiles.forEach((filename) =>
              dispatch(
                addUpdatedFile({
                  filename: filename,
                  path: newPath,
                }),
              ),
            );

            dispatch(removeSelectedFile());
          }}
        >
          edit selected files path
        </button>
      )}
      {selectedFiles.length > 0 && (
        <button
          onClick={async () => {
            const newDescription = prompt('description', description ?? '');
            if (newDescription === null) return;

            selectedFiles.forEach((filename) =>
              dispatch(
                addUpdatedFile({
                  filename: filename,
                  description: newDescription,
                }),
              ),
            );

            dispatch(removeSelectedFile());
          }}
        >
          edit selected files description
        </button>
      )}
      <button
        onClick={() => {
          if (!window.confirm(`Remove ${file.filename}?`)) return;

          dispatch(
            addRemovedFile({
              filename: file.filename,
            }),
          );
        }}
      >
        remove file
      </button>
      <AdminAccesses
        resolvedAccesses={file.resolved?.accesses}
        accesses={file.accesses}
      />
      {file.tags ? ` [${file.tags.join(',')}]` : ''}
    </>
  );
};
