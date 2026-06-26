export interface AlbumDTO {
  path: string;
  title: string;
  resolvedAccesses?: string[];
  text?: string | string[];
  filesAmount?: number;
  defaultByDate?: true;
  order?: number;
  accesses?: string[];
  defaultAccesses?: string[];
  isDb?: true;
}

export interface AlbumInterface extends AlbumDTO {
  path: string;
}
