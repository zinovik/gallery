import React, { useEffect, useRef, useState, Suspense, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  offset?: number;
  fallback?: ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  offset = 0,
  fallback = <div style={{ minHeight: 200 }} />,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: `${offset}px`,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [offset]);

  return (
    <div ref={elementRef}>
      {isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};
