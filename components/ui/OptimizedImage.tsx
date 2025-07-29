'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { getOptimizedImageUrl, useIntersectionObserver } from '@/lib/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
}

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  fallback = '/placeholder-image.jpg',
  lazy = true,
  quality = 80
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection observer for lazy loading
  const { observe } = useIntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      });
    },
    { threshold: 0.1, rootMargin: '50px' }
  );

  useEffect(() => {
    if (lazy && imgRef.current) {
      observe(imgRef.current);
    }
  }, [lazy, observe]);

  const optimizedSrc = getOptimizedImageUrl(src, width, height);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-600">📷</div>
        </div>
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={error ? fallback : optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
