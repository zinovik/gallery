import { LazyLoad } from './LazyLoad';
import { Image } from './Image';
import { Video } from './Video';
import { FileDescription } from './FileDescription';
import { Markdown } from './Markdown';
import type { FileInterface } from '../types';
import { useSearchParams } from 'react-router-dom';
import { AdminFile } from './AdminFile';
import { formatDatetime } from '../services/utils';

interface Props {
  file: FileInterface;
  isCurrent?: boolean;
}

export const File = ({ file, isCurrent }: Props) => {
  const { url, type, description, datetime, text } = file;

  const descriptionWithDatetime = `${description ? description : ''}${
    description && datetime ? ', ' : ''
  }${formatDatetime(datetime)}`;

  const [searchParams, setSearchParams] = useSearchParams();

  const handleFileClick = (): void => {
    searchParams.set('file', file.filename);
    setSearchParams(searchParams);
  };

  return (
    <>
      <AdminFile file={file} />

      {isCurrent && (
        <div
          style={{
            position: 'fixed',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'black',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {type === 'image' && (
            <Image url={url} description={descriptionWithDatetime} />
          )}
          {type === 'video' && <Video url={url} />}
        </div>
      )}

      <div id={file.filename} style={{ minHeight: 200 }}>
        <Markdown text={text} />

        <LazyLoad offset={Math.min(window.innerWidth, 880) * 0.75}>
          <div style={{ textAlign: 'center' }}>
            {type === 'image' && (
              <Image
                url={url}
                description={descriptionWithDatetime}
                onClick={handleFileClick}
              />
            )}
            {type === 'video' && <Video url={url} onClick={handleFileClick} />}
          </div>
        </LazyLoad>

        <FileDescription description={descriptionWithDatetime} />
      </div>
    </>
  );
};
