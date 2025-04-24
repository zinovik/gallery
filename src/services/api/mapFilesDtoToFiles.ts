import { FileInterface, FileType } from '../../types';

type FileDto = Omit<FileInterface, 'datetime' | 'type'>;

const getFileType = (filename: string): FileType =>
  ['mp4', 'mov'].includes(filename.split('.').pop() || '')
    ? FileType.video
    : FileType.image;

const getDatetimeFromFilename = (filename: string): string => {
  const dateTimeParsed = filename.match(
    new RegExp('^([\\d]{4})([\\d]{2})([\\d]{2})_([\\d]{2})([\\d]{2})([\\d]{2})')
  );

  if (!Array.isArray(dateTimeParsed)) {
    const dateParsed = filename.match(
      new RegExp('^([\\d]{4})([\\d]{2})([\\d]{2})')
    );

    if (!Array.isArray(dateParsed)) {
      return '';
    }

    const [, year, month, date] = dateParsed;

    return `${year}${month}${date}`;
  }

  const [, year, month, date, hour, minute, second] = dateTimeParsed;

  return `${year}${month}${date}_${hour}${minute}${second}`;
};

export const mapFilesDtoToFiles = (fileDtos: FileDto[]) =>
  fileDtos.map((fileDto) => ({
    ...fileDto,
    type: getFileType(fileDto.filename),
    datetime: getDatetimeFromFilename(fileDto.filename),
  }));
