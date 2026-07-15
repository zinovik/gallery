import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { PARAMETER_TOKEN } from '../constants';
import { AdminAccesses } from './AdminAccesses';

interface Props {
  album: AlbumInterface;
}

export const AdminAlbum = ({ album }: Props) => {
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);

  if (!isEditModeEnabled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => {
          const albumTitle =
            album.title ?? album.resolved?.title ?? 'NOT RESOLVED';

          const newPath = prompt('path', album.path);
          if (newPath === null) return;
          const newTitle = prompt('title', albumTitle);
          if (newTitle === null) return;
          const oldTextString =
            (Array.isArray(album.text) ? album.text.join('---') : album.text) ??
            '';
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
            newTitle === albumTitle &&
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

      <button
        onClick={() => {
          const path = prompt('path', album.path);
          if (path === null) return;

          const albumTitle =
            album.title ?? album.resolved?.title ?? 'NOT RESOLVED';

          dispatch(
            addAddedAlbum({
              path,
              title: albumTitle,
            }),
          );
        }}
      >
        add album
      </button>

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
          navigate(
            `/${newPath}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
          );
        }}
      >
        new path
      </button>

      <button
        onClick={async () => {
          const expiresIn = prompt('expires in, h', '24');
          if (expiresIn === null) return;

          const query = new URLSearchParams({ expires_in_h: expiresIn });

          searchParams
            .getAll('tags')
            .forEach((tag) => query.append('tags', tag));
          searchParams
            .getAll('dateRanges')
            .forEach((range) => query.append('dateRanges', range));

          const responseJson = await request(
            `/auth/share/${album.path}?${query.toString()}`,
          );

          if (!responseJson) return;

          searchParams.set(PARAMETER_TOKEN, responseJson.token);
          setSearchParams(searchParams);
        }}
      >
        share
      </button>
      <AdminAccesses
        resolvedAccesses={album.resolved?.accesses}
        accesses={album.accesses}
        defaultAccesses={album.defaultAccesses}
      />
      {album.order !== undefined ? ` [${album.order}]` : ''}
    </>
  );
};
