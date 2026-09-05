/**
 * Image Compression Utility
 * Compresses images and converts them to base64
 */

const DEFAULT_OPTIONS = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.7,
  format: 'image/jpeg'
};

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<{base64: string, mimeType: string, size: number}>}
 */
export async function compressImage(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > opts.maxWidth) {
            height = Math.round((height * opts.maxWidth) / width);
            width = opts.maxWidth;
          }
        } else {
          if (height > opts.maxHeight) {
            width = Math.round((width * opts.maxHeight) / height);
            height = opts.maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL(opts.format, opts.quality);
        const sizeInBytes = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          mimeType: opts.format,
          size: sizeInBytes,
          width,
          height
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - Image file
 * @returns {Object} - {valid: boolean, error?: string}
 */
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  return { valid: true };
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Convert a byte array to a base64 string without blowing the call stack.
 * String.fromCharCode.apply(null, bigArray) throws "Maximum call stack size
 * exceeded" once the array gets into the tens of thousands of bytes (a
 * normal JPEG easily exceeds that) because every element becomes a
 * function argument. Chunking keeps each apply() call small and safe.
 */
function bytesToBase64(bytes) {
  const CHUNK_SIZE = 0x8000; // 32K chars per chunk - safely under stack limits
  let binaryString = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray ? bytes.subarray(i, i + CHUNK_SIZE) : bytes.slice(i, i + CHUNK_SIZE);
    binaryString += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binaryString);
}

/**
 * Convert image data to proper data URL format
 * Handles multiple formats: string (base64), Buffer object, or raw bytes
 * @param {string|Object} imageData - Image data from backend
 * @param {string} mimeType - MIME type (default: image/jpeg)
 * @returns {string|null} - Data URL string or null if conversion fails
 */
export function convertImageDataToUrl(imageData, mimeType = 'image/jpeg') {
  if (!imageData) {
    return null;
  }

  try {
    // Case 1: Already a base64 string
    if (typeof imageData === 'string') {
      return `data:${mimeType};base64,${imageData}`;
    }

    // Case 2: Buffer object with data array (from JSON serialization)
    if (imageData.data && Array.isArray(imageData.data)) {
      const base64 = bytesToBase64(imageData.data);
      return `data:${mimeType};base64,${base64}`;
    }

    // Case 3: Direct Uint8Array or Buffer
    if (imageData instanceof Uint8Array || imageData instanceof Buffer) {
      const base64 = bytesToBase64(imageData);
      return `data:${mimeType};base64,${base64}`;
    }

    console.warn('Unable to convert image data. Unexpected format:', imageData);
    return null;
  } catch (error) {
    console.error('Error converting image data:', error);
    return null;
  }
}