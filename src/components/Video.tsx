interface Props {
  url: string;
  onClick?: () => void;
}

export const Video = ({ url, onClick }: Props) => {
  return (
    <>
      {onClick && (
        <div
          onClick={onClick}
          className="link"
          style={{ textAlign: 'right', cursor: 'pointer' }}
        >
          file link
        </div>
      )}

      <video
        width={'100%'}
        controls
        style={{
          display: 'block',
        }}
      >
        <source src={url} type="video/mp4" />
      </video>
    </>
  );
};
