/**
 * Centralized logging utility
 * Provides consistent logging format across the application
 */

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
const isDev = () => {
  return process.env.NODE_ENV !== 'production';
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} error - Optional error object
 * @returns {string}
 */
const formatLog = (level, message, error = null) => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (error) {
    if (error instanceof Error) {
      logMessage += `\n  Error: ${error.message}`;
      if (isDev() && error.stack) {
        logMessage += `\n  Stack: ${error.stack}`;
      }
    } else {
      logMessage += `\n  Details: ${JSON.stringify(error, null, 2)}`;
    }
  }
  
  return logMessage;
};

/**
 * Logger utility class
 */
class Logger {
  /**
   * Log an error
   * @param {string} message - Error message
   * @param {any} error - Error object or details
   * @param {Object} context - Additional context (optional)
   */
  error(message, error = null, context = null) {
    const logMessage = formatLog(LogLevel.ERROR, message, error);
    console.error(logMessage);
    
    if (context) {
      console.error('  Context:', JSON.stringify(context, null, 2));
    }
    
    // In production, you might want to send to error tracking service
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {any} details - Optional details
   */
  warn(message, details = null) {
    const logMessage = formatLog(LogLevel.WARN, message, details);
    console.warn(logMessage);
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {any} details - Optional details
   */
  info(message, details = null) {
    const logMessage = formatLog(LogLevel.INFO, message, details);
    console.log(logMessage);
  }

  /**
   * Log a debug message (only in development)
   * @param {string} message - Debug message
   * @param {any} details - Optional details
   */
  debug(message, details = null) {
    if (isDev()) {
      const logMessage = formatLog(LogLevel.DEBUG, message, details);
      console.log(logMessage);
    }
  }
}

// Export singleton instance
export default new Logger();


