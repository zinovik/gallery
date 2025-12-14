import { useState } from 'react';

interface Props {
  url: string;
  description: string;
  onClick?: () => void;
}

export const Image = ({ url, description, onClick }: Props) => {
  const [src, setSrc] = useState(url);
  const [errors, setErrors] = useState(0);

  const handleImageError = (): void => {
    console.warn('Image loading error! Reloading...');

    if (errors >= 4) return;

    setErrors(errors + 1);
    setSrc('');
    setTimeout(() => setSrc(url), 1000);
  };

  return (
    <img
      src={src}
      alt={description}
      onClick={onClick || (() => null)}
      onError={handleImageError}
      style={{
        display: 'block',
        objectFit: 'contain',
        maxWidth: '100%',
        maxHeight: '100%',
        textAlign: 'center',
        cursor: 'pointer',
      }}
    />
  );
};
