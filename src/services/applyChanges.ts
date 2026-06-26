import type {
  AddedAlbum,
  AddedFile,
  AlbumInterface,
  Changes,
  FileInterface,
  RemovedAlbum,
  RemovedFile,
  UpdatedAlbum,
  UpdatedFile,
} from '../types';
import { sortAlbums, sortFiles } from './sort';

const removeAlbums = (
  albums: AlbumInterface[],
  removedAlbums: RemovedAlbum[],
): AlbumInterface[] => {
  if (removedAlbums.length === 0) return albums;

  const removedAlbumPaths = removedAlbums.map((album) => album.path);

  return albums.filter((album) => !removedAlbumPaths.includes(album.path));
};

const removeFiles = (
  files: FileInterface[],
  removedFiles: RemovedFile[],
): FileInterface[] => {
  if (removedFiles.length === 0) return files;

  const removedFileFilenames = removedFiles.map((file) => file.filename);

  return files.filter((file) => !removedFileFilenames.includes(file.filename));
};

const addAlbums = (
  albums: AlbumInterface[],
  addedAlbums: AddedAlbum[],
): AlbumInterface[] => {
  if (addedAlbums.length === 0) return albums;

  const addedAlbumsMap = new Map<string, AddedAlbum>();
  addedAlbums.forEach((album) => addedAlbumsMap.set(album.path, album));

  const usedPaths = new Set<string>();
  const albumsWithAdded: AlbumInterface[] = [];

  albums.forEach((album) => {
    const addedAlbum = addedAlbumsMap.get(album.path);
    if (addedAlbum) {
      console.log({
        ...album,
        ...addedAlbum,
      });
      albumsWithAdded.push({
        ...album,
        ...addedAlbum,
        isDb: true,
      });
      usedPaths.add(album.path);
    } else {
      albumsWithAdded.push(album);
    }
  });

  if (addedAlbums.length === usedPaths.size) return albumsWithAdded;

  addedAlbums.forEach((addedAlbum) => {
    if (usedPaths.has(addedAlbum.path)) return;

    albumsWithAdded.push({
      title:
        addedAlbum.title ??
        addedAlbum.path
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      text: addedAlbum.text || undefined,
      path: addedAlbum.path,
      accesses: addedAlbum.accesses,
      resolvedAccesses: addedAlbum.accesses ?? [],
      isDb: true,
    });
  });

  return albumsWithAdded;
};

const addFiles = (
  files: FileInterface[],
  addedFiles: AddedFile[],
): FileInterface[] => {
  if (addedFiles.length === 0) return files;

  const currentFilesMap: Record<string, FileInterface> = {};
  files.forEach((file) => {
    currentFilesMap[file.filename] = file;
  });

  const addedFilesMap: Record<string, AddedFile> = {};
  addedFiles.forEach((file) => {
    addedFilesMap[file.filename] = file;
  });

  return files.map((file) =>
    addedFilesMap[file.filename]
      ? {
          ...currentFilesMap[file.filename],
          ...addedFilesMap[file.filename],
          isDb: true as const,
        }
      : file,
  );
};

const updateAlbums = (
  albums: AlbumInterface[],
  updatedAlbums: UpdatedAlbum[],
): AlbumInterface[] => {
  if (updatedAlbums.length === 0) return albums;

  const albumsWithUpdated = albums.map((album) => {
    const updatedAlbum = updatedAlbums.find(
      (updatedAlbum) => updatedAlbum.path === album.path,
    );

    if (!updatedAlbum) return album;

    const { newPath, ...updatedAlbumFields } = updatedAlbum;

    return {
      ...album,
      ...updatedAlbumFields,
      ...(newPath ? { path: newPath } : {}),
    };
  });

  return albumsWithUpdated;
};

const updateFiles = (files: FileInterface[], updatedFiles: UpdatedFile[]) => {
  if (updatedFiles.length === 0) return files;

  const filesWithUpdated = files.map((file) => {
    const updatedFile = updatedFiles.find(
      (updatedFile) => updatedFile.filename === file.filename,
    );

    if (!updatedFile) return file;

    return {
      ...file,
      ...updatedFile,
    };
  });

  return filesWithUpdated;
};

export const applyChanges = ({
  allAlbums,
  allFiles,
  changes,
}: {
  allAlbums: AlbumInterface[];
  allFiles: FileInterface[];
  changes: Changes;
}) => {
  const {
    remove: { albums: removedAlbums, files: removedFiles },
    add: { albums: addedAlbums, files: addedFiles },
    update: { albums: updatedAlbums, files: updatedFiles },
  } = changes;

  if (
    removedAlbums.length === 0 &&
    removedFiles.length === 0 &&
    addedAlbums.length === 0 &&
    addedFiles.length === 0 &&
    updatedAlbums.length === 0 &&
    updatedFiles.length === 0
  )
    return { albums: allAlbums, files: allFiles };

  const albumsWithoutRemoved = removeAlbums(allAlbums, removedAlbums);
  const filesWithoutRemoved = removeFiles(allFiles, removedFiles);

  const albumsWithAdded = addAlbums(albumsWithoutRemoved, addedAlbums);
  const filesWithAdded = addFiles(filesWithoutRemoved, addedFiles);

  const albumsWithUpdated = updateAlbums(albumsWithAdded, updatedAlbums);
  const filesWithUpdated = updateFiles(filesWithAdded, updatedFiles);

  return {
    albums: sortAlbums(albumsWithUpdated, filesWithUpdated),
    files: sortFiles(filesWithUpdated),
  };
};
