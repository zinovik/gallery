import { isThisOrChildPath, isTopLevelPath } from './helper';
import { FILES_URL } from '../constants';
import { FileInterface } from '../types';

let loadedFiles: Omit<FileInterface, 'url'>[] = [];

const loadFiles = async (): Promise<void> => {
  const response = await fetch(FILES_URL);

  loadedFiles = await response.json();
};

export const getFiles = async (
  path?: string
): Promise<Omit<FileInterface, 'url'>[]> => {
  if (loadedFiles.length === 0) {
    await loadFiles();
  }

  return [...loadedFiles]
    .filter((file) =>
      path ? isThisOrChildPath(file.path, path) : isTopLevelPath(file.path)
    )
    .sort((p1, p2) => (p2.order || 0) - (p1.order || 0));
};
