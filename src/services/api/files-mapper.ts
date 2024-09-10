import { FileInterface, FileType } from '../../types';

type FileDto = Omit<FileInterface, 'datetime' | 'type'>;

const getFileType = (filename: string): FileType =>
  ['mp4'].includes(filename.split('.').pop() || '')
    ? FileType.video
    : FileType.image;

const getDatetimeFromFilename = (filename: string): string => {
  const dateTimeParsed = filename.match(
    new RegExp('([\\d]{4})([\\d]{2})([\\d]{2})_([\\d]{2})([\\d]{2})')
  );

  if (!Array.isArray(dateTimeParsed)) {
    return '';
  }

  const [, year, month, date, hour, minute] = dateTimeParsed;

  return `${year}${month}${date}_${hour}${minute}`;
};

export const mapFilesDtoToFiles = (fileDtos: FileDto[]) =>
  fileDtos.map((fileDto) => ({
    ...fileDto,
    type: getFileType(fileDto.filename),
    datetime: getDatetimeFromFilename(fileDto.filename),
  }));
