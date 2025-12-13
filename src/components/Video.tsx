interface Props {
  url: string;
  onClick?: () => void;
}

export const Video = ({ url, onClick }: Props) => {
  return (
    <>
      {onClick && (
        <div onClick={onClick} className="link" style={{ textAlign: 'right' }}>
          file link
        </div>
      )}

      <video width={'100%'} controls>
        <source src={url} type="video/mp4" />
      </video>
    </>
  );
};
