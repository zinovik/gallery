export interface FileDTO {
  filename: string;
  path?: string;
  url: string;
  description?: string;
  text?: string | string[];
  tags?: string[];
  accesses?: string[];
  resolved?: {
    accesses?: string[];
    path?: string;
  };
}

export interface FileInterface extends FileDTO {
  datetime: string;
  type: 'image' | 'video';
}
