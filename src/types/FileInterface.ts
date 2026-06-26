export interface FileDTO {
  filename: string;
  path: string;
  url: string;
  resolvedAccesses?: string[];
  description?: string;
  text?: string | string[];
  accesses?: string[];
  isDb?: true;
}

export interface FileInterface extends FileDTO {
  datetime: string;
  type: 'image' | 'video';
}
