import { Link } from 'react-router-dom';
import type { AlbumInterface } from '../types';
import { getLink } from '../services/utils';
import { useAppSelector } from '../app/hooks';
import { selectIsEditModeEnabled } from '../app/stateSlices/allAlbumsAndFilesSlice';

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
          resolvedAccesses,
          accesses,
          defaultAccesses,
          isDb,
        }) => (
          <div key={path}>
            <h2>
              <Link to={getLink(path, defaultByDate)}>{`${title} ${
                typeof filesAmount === 'number' ? ` (${filesAmount})` : ''
              }`}</Link>
            </h2>
            {isEditModeEnabled && (
              <div style={{ padding: 0, margin: 0 }}>
                {isDb && <>🛢️</>}
                {resolvedAccesses?.includes('public') ||
                accesses?.includes('public') ||
                defaultAccesses?.includes('public')
                  ? '🔴'
                  : ''}
                resolved:
                {resolvedAccesses?.join(',') ?? '-'};direct:
                {accesses?.join(',') ?? '-'};default:
                {defaultAccesses?.join(',') ?? '-'}
              </div>
            )}
          </div>
        ),
      )}
    </main>
  );
};
