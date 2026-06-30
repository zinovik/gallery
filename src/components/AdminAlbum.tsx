import type { AlbumInterface } from '../types';
import {
  addAddedAlbum,
  addRemovedAlbum,
  addUpdatedAlbum,
  newAlbumPath,
  selectIsEditModeEnabled,
} from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { request } from '../services/api/request';
import { useSearchParams } from 'react-router-dom';
import { PARAMETER_TOKEN } from '../constants';

interface Props {
  album: AlbumInterface;
}

export const AdminAlbum = ({ album }: Props) => {
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);

  if (!isEditModeEnabled) {
    return null;
  }

  return (
    <>
      {album.isDb && <>🛢️</>}
      {album.isDb && (
        <button
          onClick={() => {
            const newPath = prompt('path', album.path);
            if (newPath === null) return;
            const newTitle = prompt('title', album.title);
            if (newTitle === null) return;
            const oldTextString =
              (Array.isArray(album.text)
                ? album.text.join('---')
                : album.text) ?? '';
            const newTextString = prompt('text', oldTextString);
            if (newTextString === null) return;
            const oldDefaultByDate = album.defaultByDate ? 'true' : undefined;
            const newDefaultByDate = prompt('defaultByDate', oldDefaultByDate);
            if (newDefaultByDate === null) return;
            const oldOrderString = album.order ? String(album.order) : '';
            const newOrderString = prompt('order', oldOrderString);
            if (newOrderString === null) return;
            const oldAccessesString = album.accesses
              ? album.accesses.join(',')
              : '';
            const newAccessesString = prompt('accesses', oldAccessesString);
            if (newAccessesString === null) return;
            const oldDefaultAccessesString = album.defaultAccesses
              ? album.defaultAccesses.join(',')
              : '';
            const newDefaultAccessesString = prompt(
              'defaultAccesses',
              oldDefaultAccessesString,
            );
            if (newDefaultAccessesString === null) return;

            if (
              newPath === album.path &&
              newTitle === album.title &&
              newTextString === oldTextString &&
              newDefaultByDate === oldDefaultByDate &&
              newOrderString === oldOrderString &&
              newAccessesString === oldAccessesString &&
              newDefaultAccessesString === oldDefaultAccessesString
            )
              return;

            dispatch(
              addUpdatedAlbum({
                path: album.path,
                newPath,
                title: newTitle,
                text: newTextString.includes('---')
                  ? newTextString.split('---')
                  : newTextString,
                defaultByDate: newDefaultByDate === 'true',
                order: isNaN(Number(newOrderString))
                  ? undefined
                  : Number(newOrderString),
                accesses: newAccessesString.split(',').filter(Boolean),
                defaultAccesses: newDefaultAccessesString
                  .split(',')
                  .filter(Boolean),
              }),
            );
          }}
        >
          edit album
        </button>
      )}
      <button
        onClick={() => {
          const path = prompt('path', album.path);
          if (path === null) return;

          dispatch(
            addAddedAlbum({
              path,
            }),
          );
        }}
      >
        add album
      </button>
      {album.isDb && (
        <>
          <button
            onClick={() => {
              if (!window.confirm(`Remove ${album.path}?`)) return;

              dispatch(addRemovedAlbum({ path: album.path }));
            }}
          >
            remove album
          </button>

          <button
            onClick={() => {
              const newPath = prompt('path', album.path);
              if (newPath === null) return;

              if (newPath === album.path) return;

              dispatch(newAlbumPath({ path: album.path, newPath }));
            }}
          >
            new path
          </button>
        </>
      )}
      <button
        onClick={async () => {
          const expiresIn = prompt('expires in, h', '24');
          if (expiresIn === null) return;

          const responseJson = await request(
            `/auth/share/${album.path}?expires_in_h=${expiresIn}`,
          );

          if (!responseJson) return;

          searchParams.set(PARAMETER_TOKEN, responseJson.token);
          setSearchParams(searchParams);
        }}
      >
        share
      </button>
      {album.resolvedAccesses?.includes('public') ||
      album.accesses?.includes('public') ||
      album.defaultAccesses?.includes('public')
        ? '🔴'
        : ''}
      resolved:{album.resolvedAccesses?.join(',') ?? '-'};direct:
      {album.accesses?.join(',') ?? '-'};default:
      {album.defaultAccesses?.join(',') ?? '-'};{album.order}
    </>
  );
};
