import React from 'react';
import { Link } from 'react-router-dom';
import { formatDatetime } from '../services/utils';
import { PARAMETER_DATE_RANGES } from '../constants';

interface Props {
  dateRanges: string[][] | undefined;
}

export const ShowMode = ({ dateRanges }: Props) => {
  return dateRanges ? (
    <>
      <div>
        <Link to={'?'}>by albums</Link> | by date
      </div>
      <div style={{ color: 'darkgray' }}>
        {dateRanges
          .map(
            ([from, to]) =>
              `${formatDatetime(from) || 'the very beginning'} - ${
                formatDatetime(to) || 'now'
              }`
          )
          .join(', ')}
      </div>
    </>
  ) : (
    <div>
      by albums | <Link to={`?${PARAMETER_DATE_RANGES}=`}>by date</Link>
    </div>
  );
};
