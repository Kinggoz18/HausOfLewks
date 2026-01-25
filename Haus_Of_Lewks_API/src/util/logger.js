const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const isDev = () => {
  return process.env.NODE_ENV !== 'production';
};

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

class Logger {
  error(message, error = null, context = null) {
    const logMessage = formatLog(LogLevel.ERROR, message, error);
    console.error(logMessage);
    
    if (context) {
      console.error('  Context:', JSON.stringify(context, null, 2));
    }
  }

  warn(message, details = null) {
    const logMessage = formatLog(LogLevel.WARN, message, details);
    console.warn(logMessage);
  }

  info(message, details = null) {
    const logMessage = formatLog(LogLevel.INFO, message, details);
    console.log(logMessage);
  }

  // Only logs in dev mode
  debug(message, details = null) {
    if (isDev()) {
      const logMessage = formatLog(LogLevel.DEBUG, message, details);
      console.log(logMessage);
    }
  }
}

export default new Logger();


