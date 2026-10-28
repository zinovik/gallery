interface Props {
  description: string;
}

export const FileDescription = ({ description }: Props) => (
  <p
    style={{
      color: 'darkgray',
      fontSize: '90%',
      marginTop: 0,
      textAlign: 'center',
    }}
  >
    {description}
  </p>
);
