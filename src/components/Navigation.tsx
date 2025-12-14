import { Link } from 'react-router-dom';
import { getLinks } from '../services/utils';
import { selectAllAlbums } from '../app/stateSlices/allAlbumsAndFilesSlice';
import { useAppSelector } from '../app/hooks';

interface Props {
  albumPath?: string;
  currentPath?: string;
  isAlbumTitle?: boolean;
  align?: 'left';
}

export const Navigation = ({
  albumPath,
  currentPath,
  isAlbumTitle,
  align,
}: Props) => {
  const allAlbums = useAppSelector(selectAllAlbums);

  const links = getLinks({
    albumPath,
    currentPath,
    allAlbums,
    isAlbumTitle,
  });

  return (
    <nav style={{ textAlign: align || 'right' }}>
      {links.map((link, index) => (
        <span key={link.url}>
          {index > 0 && ' | '}
          <Link to={link.url}>{link.text}</Link>
        </span>
      ))}
    </nav>
  );
};
