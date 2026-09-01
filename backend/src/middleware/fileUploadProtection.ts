/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 Secure File Upload Middleware
 * Prevents malicious file uploads
 */

// Allowed MIME types for different file types
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
};

// Max file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
};

// Dangerous file extensions to block
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.zip',
  '.rar',
  '.7z',
  '.php',
  '.asp',
  '.jsp',
  '.py',
  '.rb',
  '.sh',
];

/**
 * Validate file upload
 */
export const validateFileUpload = (
  fileName: string,
  mimeType: string,
  fileSize: number,
  allowedTypes: string[] = ALLOWED_MIME_TYPES.images
): { valid: boolean; error?: string } => {
  // Check file size
  if (fileSize > MAX_FILE_SIZES.image) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZES.image / 1024 / 1024}MB`
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed`
    };
  }

  // Check file extension
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`
    };
  }

  // Check for double extensions (e.g., file.php.jpg)
  const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
  const parts = nameWithoutExtension.split('.');
  if (parts.length > 1) {
    const suspiciousExt = '.' + parts[parts.length - 1]?.toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(suspiciousExt)) {
      return {
        valid: false,
        error: 'Double extension not allowed'
      };
    }
  }

  return { valid: true };
};

/**
 * File upload protection middleware
 */
export const fileUploadProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if request has file in body (base64 encoded)
  if (req.body?.profileImage || req.body?.image) {
    const fileData = req.body.profileImage || req.body.image;
    const fileName = req.body.profileImageFileName || req.body.imageFileName || 'image';
    const mimeType = req.body.profileImageMimeType || req.body.imageMimeType || 'image/jpeg';

    // Estimate size from base64
    const estimatedSize = Buffer.byteLength(fileData, 'base64');

    const validation = validateFileUpload(fileName, mimeType, estimatedSize);

    if (!validation.valid) {
      console.warn(`🚨 [File Upload] Validation failed: ${validation.error}`);
      return res.status(400).json({
        success: false,
        message: validation.error || 'Invalid file upload'
      });
    }
  }

  next();
};

/**
 * Sanitize file name
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts
  fileName = fileName.replace(/\.\./g, '').replace(/[\/\\]/g, '');

  // Remove special characters
  fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length
  const name = fileName.substring(0, 100);

  return name;
};
