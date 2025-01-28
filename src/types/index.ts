import { AlbumInterface } from './AlbumInterface';
import { FileInterface } from './FileInterface';

export interface AlbumWithFiles {
  album: AlbumInterface;
  files: FileInterface[];
}

export interface AddedAlbum {
  path: string;
  title: string;
  text: string | string[];
  accesses: string[];
}

export interface UpdatedAlbum {
  path: string;
  newPath?: string;
  title?: string;
  text?: string | string[];
  accesses?: string[];
  order?: number;
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

export enum FileType {
  image = 'image',
  video = 'video',
}

export enum Host {
  cloudinary = 'cloudinary.com',
}

export * from './AlbumInterface';
export * from './FileInterface';
export * from './AgendaInterface';
