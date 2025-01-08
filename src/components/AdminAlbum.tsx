import React from 'react';
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

  return (
    <>
      <button
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
          const oldAccessesString = album.accesses
            ? album.accesses.join(',')
            : '';
          const newAccessesString = prompt('accesses', oldAccessesString);
          if (newAccessesString === null) return;

          if (
            newPath === album.path &&
            newTitle === album.title &&
            newTextString === oldTextString &&
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
              accesses: newAccessesString.split(','),
            })
          );
        }}
      >
        edit album
      </button>

      <button
        onClick={() => {
          const path = prompt(`path related to ${album.path}`, album.path);
          if (path === null) return;
          const title = prompt('title');
          if (title === null) return;
          const newTextString = prompt('text');
          if (newTextString === null) return;
          const relation = prompt(
            'relation (after or before the related)',
            'after'
          );
          if (!['after', 'before'].includes(relation as string)) return;

          dispatch(
            addAddedAlbum({
              path,
              title,
              text: newTextString.includes('---')
                ? newTextString.split('---')
                : newTextString,
              relatedPath: album.path,
              relation: relation as 'after' | 'before',
            })
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
    </>
  );
};
