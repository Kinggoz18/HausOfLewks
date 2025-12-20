// Utility for conditional logging - only logs in development mode

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
export const isDev = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }
  return process.env.NODE_ENV !== 'production';
};

/**
 * Log debug message only in development mode
 * @param {...any} args - Arguments to log
 */
export const debugLog = (...args) => {
  if (isDev()) {
    console.log(...args);
  }
};

/**
 * Log error message (always logged, but with context)
 * @param {...any} args - Arguments to log
 */
export const logError = (...args) => {
  if (isDev()) {
    console.error(...args);
  }
  // In production, you might want to send to error tracking service
  // Example: Sentry.captureException(error);
};

