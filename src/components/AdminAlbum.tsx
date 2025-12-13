import { AlbumInterface } from '../types';
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

  const isRealAlbum =
    !album.title.startsWith('[') || !album.title.endsWith(']');

  return (
    <>
      <button
        disabled={!isRealAlbum}
        onClick={() => {
          const newPath = prompt('path', album.path);
          if (newPath === null) return;
          const newTitle = prompt('title', album.title);
          if (newTitle === null) return;
          const oldTextString =
            (Array.isArray(album.text) ? album.text.join('---') : album.text) ??
            '';
          const newTextString = prompt('text', oldTextString);
          if (newTextString === null) return;
          const oldOrderString = album.order ? String(album.order) : '';
          const newOrderString = prompt('order', oldOrderString);
          if (newOrderString === null) return;
          const oldAccessesString = album.accesses
            ? album.accesses.join(',')
            : '';
          const newAccessesString = prompt('accesses', oldAccessesString);
          if (newAccessesString === null) return;

          if (
            newPath === album.path &&
            newTitle === album.title &&
            newTextString === oldTextString &&
            newOrderString === oldOrderString &&
            newAccessesString === oldAccessesString
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
              order: isNaN(Number(newOrderString))
                ? undefined
                : Number(newOrderString),
              accesses: newAccessesString.split(',').filter(Boolean),
            })
          );
        }}
      >
        edit album
      </button>
      <button
        onClick={() => {
          const path = prompt('path', album.path);
          if (path === null) return;
          const title = prompt('title');
          if (title === null) return;
          const textString = prompt('text');
          if (textString === null) return;
          const accessesString = prompt('accesses', 'public');
          if (accessesString === null) return;

          dispatch(
            addAddedAlbum({
              path,
              title,
              text: textString.includes('---')
                ? textString.split('---')
                : textString,
              accesses: accessesString.split(','),
            })
          );
        }}
      >
        add album
      </button>
      <button
        disabled={!isRealAlbum}
        onClick={() => {
          if (!window.confirm(`Remove ${album.path}?`)) return;

          dispatch(addRemovedAlbum({ path: album.path }));
        }}
      >
        remove album
      </button>
      <button
        disabled={!isRealAlbum}
        onClick={() => {
          const newPath = prompt('path', album.path);
          if (newPath === null) return;

          if (newPath === album.path) return;

          dispatch(newAlbumPath({ path: album.path, newPath }));
        }}
      >
        new path
      </button>
      <button
        onClick={async () => {
          const expiresIn = prompt('expires in, h', '24');
          if (expiresIn === null) return;

          const [responseJson, status] = await request(
            `/auth/share/${album.path}?expires_in_h=${expiresIn}`
          );

          if (status >= 400) {
            alert(responseJson.message || 'request error');
            return;
          }

          searchParams.set(PARAMETER_TOKEN, responseJson.token);
          setSearchParams(searchParams);
        }}
      >
        share
      </button>
      {` ${album.path} | ${
        album.accesses.includes('public') ? '🔴 ' : ''
      }${album.accesses.join(',')}`}
      {album.order ? `; ${album.order}` : ''}
    </>
  );
};
