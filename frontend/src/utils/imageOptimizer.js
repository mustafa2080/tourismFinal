/**
 * Image Optimization Utilities
 * Optimizes images for better performance and faster loading
 */

export class ImageOptimizer {
  /**
   * Compress image before upload
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob: Blob | null) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = () => reject(new Error('Could not load image'));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate multiple sizes for responsive images
   */
  static generateImageSrcSet(
    baseUrl: string,
    filename: string
  ): {
    srcSet: string;
    sizes: string;
  } {
    const sizes = [320, 640, 1024, 1200];
    const srcSet = sizes
      .map((size) => `${baseUrl}?w=${size} ${size}w`)
      .join(', ');

    return {
      srcSet,
      sizes: '(max-width: 320px) 100vw, (max-width: 640px) 100vw, (max-width: 1024px) 50vw, 100vw',
    };
  }

  /**
   * Generate thumbnail
   */
  static generateThumbnail(
    baseUrl: string,
    width: number = 400,
    height: number = 300
  ): string {
    return `${baseUrl}?w=${width}&h=${height}&fit=cover`;
  }

  /**
   * Format image URL for CDN delivery
   */
  static formatImageUrl(
    url: string,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    }
  ): string {
    const params = new URLSearchParams();

    if (options?.width) params.append('w', options.width.toString());
    if (options?.height) params.append('h', options.height.toString());
    if (options?.quality) params.append('q', options.quality.toString());
    if (options?.format) params.append('f', options.format);

    const separator = url.includes('?') ? '&' : '?';
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
  }
}

/**
 * Lazy Loading Image Component Hook
 */
export const useOptimizedImage = (
  src: string,
  options?: { width?: number; height?: number }
) => {
  const optimizedUrl = ImageOptimizer.formatImageUrl(src, options);
  const thumbnailUrl = ImageOptimizer.generateThumbnail(src, 50, 50);

  return {
    src: optimizedUrl,
    placeholder: thumbnailUrl,
    srcSet: ImageOptimizer.generateImageSrcSet(src, '').srcSet,
  };
};
