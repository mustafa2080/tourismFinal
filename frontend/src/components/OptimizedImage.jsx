/**
 * SEO Optimized Image Component
 * Handles image optimization for better SEO and performance
 */

import React, { useState, useEffect } from 'react';

export const OptimizedImage = ({
  src,
  alt,
  title,
  width,
  height,
  loading = 'lazy',
  className = '',
  onLoad,
  placeholder = true,
  WebP = true
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if WebP is supported
    if (WebP) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      if (canvas.toDataURL('image/webp').indexOf('image/webp') === 5) {
        // WebP is supported, convert image URL
        const webpSrc = src?.replace(/\.(jpg|jpeg|png)$/i, '.webp') || src;
        setImageSrc(webpSrc);
      } else {
        setImageSrc(src);
      }
    } else {
      setImageSrc(src);
    }
  }, [src, WebP]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  return (
    <>
      {placeholder && !isLoaded && (
        <div
          className={`${className} bg-gray-200 animate-pulse`}
          style={{ width, height }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        title={title || alt}
        width={width}
        height={height}
        loading={loading}
        className={`${className} ${!isLoaded && placeholder ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        decoding="async"
      />
    </>
  );
};

export default OptimizedImage;
