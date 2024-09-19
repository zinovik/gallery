import { AlbumInterface } from './AlbumInterface';
import { FileInterface } from './FileInterface';

export interface AlbumWithFiles {
  album: AlbumInterface;
  files: FileInterface[];
}

export interface AddedAlbum {
  pathPart: string;
  title: string;
  text: string | string[];
  relatedPath: string;
  relation: 'after' | 'before' | 'in';
}

export interface UpdatedAlbum {
  path: string;
  newPath?: string;
  title?: string;
  text?: string | string[];
  accesses?: string[];
}

export interface UpdatedFile {
  filename: string;
  path?: string;
  isTitle?: boolean;
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
