/**
 * 🔐 Input Sanitization Module
 * Prevents XSS attacks by sanitizing user input and rendered content
 * Uses regex-based patterns instead of requiring DOMPurify dependency
 */

/**
 * Regex patterns for detecting common XSS vectors
 */
const XSS_PATTERNS = {
  // Event handlers
  eventHandlers: /on\w+\s*=\s*["']?([^"'>\s]+)["']?/gi,
  // Script tags
  scriptTags: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  // iframe tags
  iframeTags: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  // Dangerous protocols
  dangerousProtocols: /(javascript|data|vbscript):/gi,
  // Object/embed tags
  objectEmbed: /<(object|embed|link)[^>]*>/gi,
  // Style expressions in IE
  styleExpression: /expression\s*\(/gi,
  // HTML tags
  htmlTags: /<[^>]*>/g,
};

/**
 * 🔐 Sanitize HTML/Rich Text
 * Removes potentially malicious HTML tags and attributes
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Safe HTML string
 */
export const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let sanitized = html;

  // Remove script tags
  sanitized = sanitized.replace(XSS_PATTERNS.scriptTags, '');

  // Remove iframe tags
  sanitized = sanitized.replace(XSS_PATTERNS.iframeTags, '');

  // Remove object and embed tags
  sanitized = sanitized.replace(XSS_PATTERNS.objectEmbed, '');

  // Remove event handlers from tags
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["']?[^"'>\s]*["']?/gi, '');

  // Remove style expressions (IE specific)
  sanitized = sanitized.replace(XSS_PATTERNS.styleExpression, '');

  // Remove dangerous protocols from href/src
  sanitized = sanitized.replace(/\s+(href|src)\s*=\s*["']?(javascript|data|vbscript):[^"']*["']?/gi, '');

  return sanitized.trim();
};

/**
 * 🔐 Sanitize Plain Text
 * Escapes HTML special characters for display
 * @param {string} text - Text to sanitize
 * @returns {string} - Safe text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

/**
 * 🔐 Sanitize User Input (Form fields)
 * Trims, removes HTML tags, and escapes special characters
 * @param {string} input - User input to sanitize
 * @returns {string} - Safe input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(XSS_PATTERNS.htmlTags, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
};

/**
 * 🔐 Sanitize JSON String
 * Safely parses and re-stringifies JSON to prevent injection
 * @param {string} jsonString - JSON string to sanitize
 * @returns {object|null} - Parsed and safe JSON object or null
 */
export const sanitizeJSON = (jsonString) => {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return null;
    }

    // First parse to validate JSON structure
    const parsed = JSON.parse(jsonString);

    // Re-stringify to ensure clean JSON
    return JSON.parse(JSON.stringify(parsed));
  } catch (error) {
    console.error('❌ [sanitizeJSON] Invalid JSON:', error.message);
    return null;
  }
};

/**
 * 🔐 Sanitize URL
 * Validates and safely handles URLs
 * @param {string} url - URL to sanitize
 * @returns {string} - Safe URL or empty string
 */
export const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    // Check for dangerous protocols
    if (XSS_PATTERNS.dangerousProtocols.test(url)) {
      return '';
    }

    // If it's a relative URL, ensure it starts with / or #
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/') && !url.startsWith('#')) {
      return '/' + url;
    }

    // For absolute URLs, validate format
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url);
        return url;
      } catch {
        return '';
      }
    }

    return url;
  } catch (error) {
    console.error('❌ [sanitizeURL] Error sanitizing URL:', error.message);
    return '';
  }
};

/**
 * 🔐 Sanitize Email
 * Basic email validation and sanitization
 * @param {string} email - Email to sanitize
 * @returns {string} - Safe email or empty string
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const trimmed = email.trim().toLowerCase();
  
  if (emailRegex.test(trimmed)) {
    return trimmed;
  }

  return '';
};

/**
 * 🔐 Sanitize Object (recursively)
 * Recursively sanitizes all string values in an object
 * @param {object} obj - Object to sanitize
 * @param {string} type - Type of sanitization ('text', 'html', 'input')
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj, type = 'text') => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitizeFn = {
    text: sanitizeText,
    html: sanitizeHTML,
    input: sanitizeInput,
  }[type] || sanitizeText;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = sanitizeFn(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value, type);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * 🔐 Detect XSS Patterns
 * Returns true if potentially malicious content is detected
 * @param {string} text - Text to check
 * @returns {boolean} - True if suspicious patterns found
 */
export const detectXSSPatterns = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  return (
    XSS_PATTERNS.eventHandlers.test(text) ||
    XSS_PATTERNS.scriptTags.test(text) ||
    XSS_PATTERNS.iframeTags.test(text) ||
    XSS_PATTERNS.objectEmbed.test(text) ||
    XSS_PATTERNS.styleExpression.test(text) ||
    XSS_PATTERNS.dangerousProtocols.test(text)
  );
};

/**
 * 🔐 Get Sanitization Report
 * Provides detailed information about what was removed
 * @param {string} original - Original text
 * @param {string} sanitized - Sanitized text
 * @returns {object} - Report with details
 */
export const getSanitizationReport = (original, sanitized) => {
  const removed = original.length - sanitized.length;
  const hasXSS = detectXSSPatterns(original);

  return {
    originalLength: original.length,
    sanitizedLength: sanitized.length,
    charsRemoved: removed,
    percentageRemoved: Math.round((removed / original.length) * 100),
    hadXSSPatterns: hasXSS,
    isSuspicious: removed > original.length * 0.3 || hasXSS, // More than 30% removed
  };
};

export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeInput,
  sanitizeJSON,
  sanitizeURL,
  sanitizeEmail,
  sanitizeObject,
  detectXSSPatterns,
  getSanitizationReport,
};
