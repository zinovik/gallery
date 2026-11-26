import { Link } from 'react-router-dom';
import { getLink } from '../services/utils';

interface Props extends React.PropsWithChildren {
  filesTags: string[];
  currentPath: string;
  tags?: string[];
  dateRanges?: string[][];
}

const ALL_TAGS = 'all';

export const Tags = ({ filesTags, tags, currentPath, dateRanges }: Props) => {
  if (filesTags.length === 0) {
    return null;
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {[...filesTags, ALL_TAGS].map((filesTag, index) => (
        <span key={filesTag}>
          {index > 0 && ' '}
          {index === filesTags.length ? (
            !tags || tags.length === 0 ? (
              filesTag
            ) : (
              <Link to={getLink(currentPath, dateRanges, [])}>{filesTag}</Link>
            )
          ) : (
            <Link
              to={getLink(
                currentPath,
                dateRanges,
                tags?.includes(filesTag)
                  ? tags.filter((tag) => tag !== filesTag)
                  : [...(tags ?? []), filesTag],
              )}
            >
              {tags?.includes(filesTag) ? `[#${filesTag}]` : `#${filesTag}`}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
};
