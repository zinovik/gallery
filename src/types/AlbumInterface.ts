export interface AlbumDTO {
  path: string;
  title: string;
  text?: string | string[];
  filesAmount?: number;
  defaultByDate?: true;
  order?: number;
  accesses?: string[];
}

export interface AlbumInterface extends AlbumDTO {
  path: string;
}
