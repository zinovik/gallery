import React from 'react';
import { Link } from 'react-router-dom';
import { Title } from './Title';
import { Markdown } from './Markdown';
import { File } from './File';
import { Agenda } from './Agenda';
import { AgendaInterface, AlbumWithFiles } from '../types';
import { AdminAlbum } from './AdminAlbum';
import { HashLink } from 'react-router-hash-link';
import { getLevel } from '../services/utils';
import { PARAMETER_DATE_RANGES } from '../constants';

interface Props {
  albumWithFiles: AlbumWithFiles;
  isCurrentOpenedAlbum: boolean;
  albumAgenda: AgendaInterface[];
  currentFile: string | null;
  isHiddenHashLink?: boolean;
}

export const Album = ({
  albumWithFiles,
  isCurrentOpenedAlbum,
  albumAgenda,
  currentFile,
  isHiddenHashLink,
}: Props) => {
  const { album, files } = albumWithFiles;
  const level = getLevel(album.path);
  const isTopLevelAlbum = level === 1;

  return (
    <>
      <AdminAlbum album={album} />

      {isCurrentOpenedAlbum && <Title level={level}>{album.title}</Title>}

      {!isCurrentOpenedAlbum && (
        <Title level={level}>
          <Link
            id={album.path}
            to={`/${album.path}${
              album.defaultByDate ? `?${PARAMETER_DATE_RANGES}=` : ''
            }`}
          >
            {album.title}
          </Link>{' '}
          {!isHiddenHashLink && <HashLink to={`#${album.path}`}>#</HashLink>}
        </Title>
      )}

      {isCurrentOpenedAlbum && !isTopLevelAlbum && (
        <Agenda agenda={albumAgenda} />
      )}

      <Markdown text={album.text} />

      {files.map((file) => (
        <File
          file={file}
          key={file.url}
          isCurrent={file.filename === currentFile}
        />
      ))}

      {isTopLevelAlbum && <Agenda agenda={albumAgenda} />}
    </>
  );
};
