/**
 * Input validation and sanitization utilities
 */

import { ObjectId } from 'mongodb';

/**
 * Sanitize string input to prevent XSS and trim whitespace
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum length (optional)
 * @returns {string}
 */
export const sanitizeString = (input, maxLength = null) => {
  if (!input || typeof input !== 'string') return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove potential XSS patterns
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  // Limit length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Sanitize email address
 * @param {string} email - Email address
 * @returns {string|null}
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return null;
  
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Sanitize phone number (removes non-numeric characters except +)
 * @param {string} phone - Phone number
 * @returns {string|null}
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Remove all non-numeric characters except +
  const sanitized = phone.replace(/[^\d+]/g, '');
  
  if (sanitized.length < 10) {
    return null;
  }
  
  return sanitized;
};

/**
 * Validate and convert to ObjectId
 * @param {string|ObjectId} id - ID to validate
 * @returns {ObjectId|null}
 */
export const validateObjectId = (id) => {
  if (!id) return null;
  
  try {
    if (id instanceof ObjectId) {
      return id;
    }
    
    if (typeof id === 'string' && ObjectId.isValid(id)) {
      return ObjectId.createFromHexString(id);
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Validate number within range
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number|null}
 */
export const validateNumber = (value, min = null, max = null) => {
  const num = Number(value);
  
  if (isNaN(num)) return null;
  
  if (min !== null && num < min) return null;
  if (max !== null && num > max) return null;
  
  return num;
};

/**
 * Validate date string or Date object
 * @param {string|Date} date - Date to validate
 * @returns {Date|null}
 */
export const validateDate = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    
    return dateObj;
  } catch (error) {
    return null;
  }
};

/**
 * Validate required fields in an object
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{ valid: boolean, missing: string[] }}
 */
export const validateRequired = (data, requiredFields) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields };
  }
  
  const missing = requiredFields.filter(field => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Function} sanitizer - Sanitizer function to apply to string values
 * @returns {Object}
 */
export const sanitizeObject = (obj, sanitizer = sanitizeString) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sanitizer));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizer(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, sanitizer);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};


