import apiClient from './apiClient';
import { compressImage, validateImageFile, formatFileSize } from '../utils/imageCompression';

export const uploadService = {
  /**
   * Upload single image
   * @param {File} file - Image file to upload
   * @param {string} category - Category (packages, blog, profiles, etc.)
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Object>} - { url: string, publicId: string, size: number }
   */
  async uploadImage(file, category = 'general', onProgress = null) {
    if (!file) {
      throw new Error('File is required');
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },

  /**
   * Upload multiple images
   * @param {File[]} files - Array of image files
   * @param {string} category - Category for all images
   * @param {Function} onProgress - Progress callback (optional)
   * @returns {Promise<Array>} - Array of uploaded image data
   */
  async uploadMultipleImages(files, category = 'general', onProgress = null) {
    if (!files || files.length === 0) {
      throw new Error('At least one file is required');
    }
    
    if (files.length > 20) {
      throw new Error('Maximum 20 files can be uploaded at once');
    }
    
    const formData = new FormData();
    
    // Validate all files before uploading
    files.forEach((file, index) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${index + 1}: Only JPEG, PNG, GIF, and WebP images are allowed`);
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File ${index + 1}: Size must be less than 5MB`);
      }
      
      formData.append('files', file);
    });
    
    formData.append('category', category);
    
    return apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },

  /**
   * Delete image by URL
   * @param {string} imageUrl - Image URL to delete
   * @returns {Promise<void>}
   */
  async deleteImage(imageUrl) {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    return apiClient.post('/upload/delete', { imageUrl });
  },

  /**
   * Delete multiple images
   * @param {string[]} imageUrls - Array of image URLs
   * @returns {Promise<Object>} - { deleted: number, failed: number }
   */
  async deleteMultipleImages(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }
    
    return apiClient.post('/upload/delete-multiple', { imageUrls });
  },

  /**
   * Get upload progress for a file
   * @param {string} uploadId - Upload session ID
   * @returns {Promise<Object>} - { progress: number, status: string }
   */
  async getUploadProgress(uploadId) {
    return apiClient.get(`/upload/progress/${uploadId}`);
  },

  /**
   * Crop and optimize image
   * @param {string} imageUrl - Original image URL
   * @param {Object} cropData - { x, y, width, height, zoom }
   * @returns {Promise<Object>} - { croppedUrl: string }
   */
  async cropImage(imageUrl, cropData) {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    return apiClient.post('/upload/crop', { imageUrl, cropData });
  },

  /**
   * Resize image
   * @param {string} imageUrl - Original image URL
   * @param {Object} sizeData - { width, height, fit }
   * @returns {Promise<Object>} - { resizedUrl: string }
   */
  async resizeImage(imageUrl, sizeData) {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    return apiClient.post('/upload/resize', { imageUrl, sizeData });
  },

  /**
   * Get image metadata
   * @param {string} imageUrl - Image URL
   * @returns {Promise<Object>} - { width, height, format, size }
   */
  async getImageMetadata(imageUrl) {
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    return apiClient.get('/upload/metadata', { params: { url: imageUrl } });
  },

  /**
   * Get upload statistics
   * @returns {Promise<Object>} - { totalUploads, totalSize, uploadedToday }
   */
  async getUploadStats() {
    return apiClient.get('/upload/stats');
  },

  /**
   * Clear unused images (admin only)
   * @returns {Promise<Object>} - { cleared: number, freedSpace: number }
   */
  async clearUnusedImages() {
    return apiClient.post('/admin/upload/cleanup');
  },

  /**
   * Upload compressed profile image
   * @param {File} file - Image file
   * @param {Object} options - Compression options
   * @returns {Promise<Object>} - { base64, mimeType, size }
   */
  async uploadProfileImage(file, options = {}) {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Compress image
    const compressed = await compressImage(file, options);
    
    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = compressed.base64.split(',')[1];

    return {
      base64: base64Data,
      mimeType: compressed.mimeType,
      size: compressed.size,
      width: compressed.width,
      height: compressed.height
    };
  },

  /**
   * Convert image file to base64 string
   * @param {File} file - Image file
   * @returns {Promise<string>} - Base64 string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Convert multiple images to base64
   * @param {File[]} files - Image files
   * @returns {Promise<Array>} - Array of base64 strings with metadata
   */
  async filesToBase64(files) {
    const results = [];
    for (const file of files) {
      const base64 = await this.fileToBase64(file);
      results.push({
        image_data: base64.split(',')[1], // Remove data:image/..;base64, prefix
        alt_text: file.name,
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
    return results;
  }
};
