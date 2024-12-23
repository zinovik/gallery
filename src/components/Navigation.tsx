import React from 'react';
import { Link } from 'react-router-dom';
import { getLinks } from '../services/utils';
import { selectAllAlbums } from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppSelector } from '../app/hooks';

interface Props {
  path: string;
}

export const Navigation = ({ path }: Props) => {
  const allAlbums = useAppSelector(selectAllAlbums);

  const links = getLinks(path, allAlbums);

  return (
    <nav style={{ textAlign: 'right', paddingTop: '1rem' }}>
      <Link to={'/'}>home</Link>
      {links.map((link) => (
        <span key={link.url}>
          {' / '}
          <Link to={link.url}>{link.text}</Link>
        </span>
      ))}
    </nav>
  );
};
