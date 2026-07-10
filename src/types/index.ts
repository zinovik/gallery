import type { AlbumInterface } from './AlbumInterface';
import type { FileInterface } from './FileInterface';

export interface AlbumWithFiles {
  album: AlbumInterface;
  files: FileInterface[];
}

export interface AddedAlbum {
  path: string;
  title?: string;
  text?: string | string[];
  defaultByDate?: boolean;
  order?: number;
  accesses?: string[];
  defaultAccesses?: string[];
}

export interface UpdatedAlbum {
  path: string;
  newPath?: string;
  title?: string;
  text?: string | string[];
  defaultByDate?: boolean;
  order?: number;
  accesses?: string[];
  defaultAccesses?: string[];
}

export interface NewAlbumPath {
  path: string;
  newPath: string;
}

export interface UpdatedFile {
  filename: string;
  path?: string;
  description?: string;
  text?: string | string[];
  tags?: string[];
  accesses?: string[];
}

export interface RemovedAlbum {
  path: string;
}

export interface RemovedFile {
  filename: string;
}

export interface Changes {
  remove: {
    albums: RemovedAlbum[];
    files: RemovedFile[];
  };
  add: {
    albums: AddedAlbum[];
  };
  update: {
    albums: UpdatedAlbum[];
    files: UpdatedFile[];
  };
}

export type FileType = 'image' | 'video';

export * from './AlbumInterface';
export * from './FileInterface';
export * from './AgendaInterface';
