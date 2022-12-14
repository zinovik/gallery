export const PARAMETER_NAME = 'file';

const baseUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://raw.githubusercontent.com/zinovik/gallery-data/main';

export const SECTIONS_URL = `${baseUrl}/sections.json`;
export const FILES_URL = `${baseUrl}/files.json`;
export const FILE_URLS_URL = `${baseUrl}/file-urls.json`;
