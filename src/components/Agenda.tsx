import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { AgendaInterface } from '../types';
import { getLevel } from '../services/utils';

interface Props {
  agenda: AgendaInterface[];
}

export const Agenda = ({ agenda }: Props) => {
  const minLevel = agenda.reduce(
    (minLevel, { path }) =>
      minLevel ? Math.min(minLevel, getLevel(path)) : getLevel(path),
    0
  );

  return (
    <div>
      {agenda.map(({ title, path }, index) => (
        <p
          key={path + index}
          style={{ paddingLeft: `${getLevel(path) - minLevel + 1}rem` }}
        >
          <Link to={`/${path}`}>{title}</Link>{' '}
          <HashLink to={`#${path}`}>↓#</HashLink>
        </p>
      ))}
      {agenda.length > 0 && <hr />}
    </div>
  );
};
