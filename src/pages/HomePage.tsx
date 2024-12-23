import React from 'react';
import { Link } from 'react-router-dom';
import { AlbumInterface } from '../types';
import { getLink } from '../services/utils';

interface Props {
  albums: AlbumInterface[];
}

export const HomePage = ({ albums }: Props) => {
  return (
    <main>
      {albums.map(({ title, path, filesAmount, defaultByDate }) => (
        <div key={path}>
          <h2>
            <Link
              to={getLink(path, defaultByDate)}
            >{`${title} (${filesAmount})`}</Link>
          </h2>
        </div>
      ))}
    </main>
  );
};
