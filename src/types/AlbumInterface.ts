export interface AlbumDTO {
  path: string;
  title?: string;
  text?: string | string[];
  filesAmount?: number;
  defaultByDate?: boolean;
  order?: number;
  accesses?: string[];
  defaultAccesses?: string[];
  resolved?: {
    accesses?: string[];
    title?: string;
    order?: number;
  };
}

export interface AlbumInterface extends AlbumDTO {
  path: string;
}
