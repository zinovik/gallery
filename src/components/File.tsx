import React from 'react';
import LazyLoad from 'react-lazy-load';
import { Image } from './Image';
import { Video } from './Video';
import { FileDescription } from './FileDescription';
import { Markdown } from './Markdown';
import { formatDatetime, getThumbnail } from '../services/helper';
import { FileType } from '../constants';
import { FileInterface } from '../types';

interface Props {
  file: FileInterface;
  clickUrl?: string; // if provided - go to on click
  isSkipFileText?: boolean; // used for the home page
  isTextAfterFile?: boolean;
  isCurrent?: boolean;
}

export const File = ({
  file,
  clickUrl,
  isSkipFileText,
  isTextAfterFile,
  isCurrent,
}: Props) => {
  const { url, type, isNoThumbnail, description, datetime, text } = file;
  const thumbnailUrl = isNoThumbnail
    ? url
    : getThumbnail(url, window.innerWidth);

  const descriptionWithDatetime = `${description}${
    description && datetime && ', '
  }${formatDatetime(datetime)}`;

  return (
    <>
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
            <Image
              url={thumbnailUrl}
              description={descriptionWithDatetime}
              clickUrl={clickUrl}
            />
          )}
          {type === FileType.video && (
            <Video url={thumbnailUrl} description={descriptionWithDatetime} />
          )}
        </div>
      )}

      <div id={file.filename} style={{ minHeight: 200 }}>
        {!isTextAfterFile && !isSkipFileText && <Markdown text={text} />}

        <LazyLoad offset={500}>
          <div style={{ textAlign: 'center' }}>
            {type === FileType.image && (
              <Image
                url={thumbnailUrl}
                description={descriptionWithDatetime}
                clickUrl={clickUrl}
              />
            )}
            {type === FileType.video && (
              <Video url={thumbnailUrl} description={descriptionWithDatetime} />
            )}
          </div>
        </LazyLoad>

        <FileDescription description={descriptionWithDatetime} />

        {isTextAfterFile && !isSkipFileText && <Markdown text={text} />}
      </div>
    </>
  );
};
