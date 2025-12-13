interface Props {
  description: string;
}

export const FileDescription = ({ description }: Props) =>
  description ? (
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
  ) : null;
