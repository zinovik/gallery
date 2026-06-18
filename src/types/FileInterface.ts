export interface FileDTO {
  filename: string;
  path: string;
  url: string;
  description?: string;
  text?: string | string[];
  accesses?: string[];
}

export interface FileInterface extends FileDTO {
  type: 'image' | 'video';
  datetime: string;
}
