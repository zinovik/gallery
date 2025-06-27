import React from 'react';
import { Link } from 'react-router-dom';
import { AlbumInterface } from '../types';
import { getLink } from '../services/utils';
import { useAppSelector } from '../app/hooks';
import { selectIsEditModeEnabled } from '../app/stateSlices/allAlbumsAndFilesSlice';

interface Props {
  albums: AlbumInterface[];
}

export const HomePage = ({ albums }: Props) => {
  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);

  return (
    <main>
      {albums.map(({ title, path, filesAmount, defaultByDate, accesses }) => (
        <div key={path}>
          <h2>
            <Link to={getLink(path, defaultByDate)}>{`${title} ${
              typeof filesAmount === 'number' ? ` (${filesAmount})` : ''
            }${
              isEditModeEnabled
                ? ` | ${
                    accesses.includes('public') ? '🔴 ' : ''
                  }${accesses.join(', ')}`
                : ''
            }`}</Link>
          </h2>
        </div>
      ))}
    </main>
  );
};
