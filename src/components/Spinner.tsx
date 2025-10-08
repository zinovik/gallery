import { useEffect, useState } from 'react';

export const Spinner = () => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(
      () => setElapsed((performance.now() - start) / 1000),
      100
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: '0.5rem' }}>
      ⏳ Loading... Please wait - {elapsed.toFixed(1)}s
    </main>
  );
};
