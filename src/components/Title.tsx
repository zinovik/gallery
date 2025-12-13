interface Props extends React.PropsWithChildren {
  level: number;
}

export const Title = ({ level, children }: Props) => (
  <>
    {level === 1 && <h1>{children}</h1>}
    {level === 2 && <h2>{children}</h2>}
    {level === 3 && <h3>{children}</h3>}
    {level === 4 && <h4>{children}</h4>}
    {level === 5 && <h5>{children}</h5>}
    {level > 5 && <h6>{children}</h6>}
  </>
);
