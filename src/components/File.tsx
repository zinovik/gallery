import { LazyLoad } from './LazyLoad';
import { Image } from './Image';
import { Video } from './Video';
import { FileDescription } from './FileDescription';
import { Markdown } from './Markdown';
import { FileInterface, FileType } from '../types';
import { useSearchParams } from 'react-router-dom';
import { AdminFile } from './AdminFile';
import { formatDatetime, getThumbnail } from '../services/utils';

interface Props {
  file: FileInterface;
  isCurrent?: boolean;
}

export const File = ({ file, isCurrent }: Props) => {
  const { url, type, isNoThumbnail, description, datetime, text } = file;
  const thumbnailUrl = isNoThumbnail
    ? url
    : getThumbnail(url, window.innerWidth);

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
          {type === FileType.image && (
            <Image url={thumbnailUrl} description={descriptionWithDatetime} />
          )}
          {type === FileType.video && <Video url={thumbnailUrl} />}
        </div>
      )}

      <div id={file.filename} style={{ minHeight: 200 }}>
        <Markdown text={text} />

        <LazyLoad offset={Math.min(window.innerWidth, 880) * 0.75}>
          <div style={{ textAlign: 'center' }}>
            {type === FileType.image && (
              <Image
                url={thumbnailUrl}
                description={descriptionWithDatetime}
                onClick={handleFileClick}
              />
            )}
            {type === FileType.video && (
              <Video url={thumbnailUrl} onClick={handleFileClick} />
            )}
          </div>
        </LazyLoad>

        <FileDescription description={descriptionWithDatetime} />
      </div>
    </>
  );
};
