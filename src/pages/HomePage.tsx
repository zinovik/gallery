import { Link } from 'react-router-dom';
import type { AlbumInterface } from '../types';
import { getLink } from '../services/utils';
import { useAppSelector } from '../app/hooks';
import { selectIsEditModeEnabled } from '../app/stateSlices/allAlbumsAndFilesSlice';
import { AdminAccesses } from '../components/AdminAccesses';

interface Props {
  albums: AlbumInterface[];
}

export const HomePage = ({ albums }: Props) => {
  const isEditModeEnabled = useAppSelector(selectIsEditModeEnabled);

  return (
    <main style={{ paddingTop: '1.5rem' }}>
      {albums.map(
        ({
          title,
          path,
          filesAmount,
          defaultByDate,
          accesses,
          defaultAccesses,
          resolved,
        }) => (
          <div key={path}>
            <h2>
              <Link to={getLink(path, defaultByDate)}>{`${title} ${
                typeof filesAmount === 'number' ? ` (${filesAmount})` : ''
              }`}</Link>
            </h2>
            {isEditModeEnabled && (
              <AdminAccesses
                resolvedAccesses={resolved?.accesses}
                accesses={accesses}
                defaultAccesses={defaultAccesses}
              />
            )}
          </div>
        ),
      )}
    </main>
  );
};
