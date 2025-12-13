import { Link } from 'react-router-dom';
import { formatDatetime } from '../services/utils';
import { PARAMETER_DATE_RANGES } from '../constants';

interface Props {
  dateRanges: string[][] | undefined;
  currentPath: string;
}

export const ShowMode = ({ dateRanges, currentPath }: Props) => {
  if (dateRanges) {
    return (
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
    );
  }

  let dateRangesLink = '';

  if (!currentPath) {
    const threeMonthsAgoDate = new Date();
    threeMonthsAgoDate.setMonth(threeMonthsAgoDate.getMonth() - 3);

    dateRangesLink = threeMonthsAgoDate
      .toISOString()
      .replaceAll('-', '')
      .slice(0, 8);
  }

  return (
    <div>
      by albums |{' '}
      <Link to={`?${PARAMETER_DATE_RANGES}=${dateRangesLink}`}>by date</Link>
    </div>
  );
};
