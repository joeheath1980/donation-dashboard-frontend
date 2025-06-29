// Secure logging utility
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Log levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// Sensitive patterns to filter
const SENSITIVE_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /api[_-]?key/i,
  /auth/i,
  /bearer/i,
  /jwt/i,
  /session/i,
  /cookie/i,
  /credential/i,
];

// Check if a key or value contains sensitive data
const isSensitive = (key, value) => {
  const keyStr = String(key).toLowerCase();
  const valueStr = String(value).toLowerCase();
  
  return SENSITIVE_PATTERNS.some(pattern => 
    pattern.test(keyStr) || pattern.test(valueStr)
  );
};

// Sanitize object for logging
const sanitizeObject = (obj, depth = 0, maxDepth = 5) => {
  if (depth > maxDepth) return '[MAX_DEPTH_REACHED]';
  
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') {
    return isSensitive('', obj) ? '[REDACTED]' : obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, maxDepth));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitive(key, value)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1, maxDepth);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Main logger class
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }
  
  // Format log message
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    return { prefix, message, data: data ? sanitizeObject(data) : undefined };
  }
  
  // Core logging method
  log(level, message, data) {
    // Don't log in production unless it's an error
    if (!isDevelopment && !isTest && level !== LOG_LEVELS.ERROR) {
      return;
    }
    
    const { prefix, message: msg, data: sanitizedData } = this.formatMessage(level, message, data);
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(prefix, msg, sanitizedData);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, msg, sanitizedData);
        break;
      case LOG_LEVELS.INFO:
        console.info(prefix, msg, sanitizedData);
        break;
      case LOG_LEVELS.DEBUG:
        if (isDevelopment) {
          console.debug(prefix, msg, sanitizedData);
        }
        break;
      default:
        console.log(prefix, msg, sanitizedData);
    }
  }
  
  // Convenience methods
  error(message, data) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }
  
  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }
  
  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }
  
  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }
}

// Create logger factory
export const createLogger = (context) => new Logger(context);

// Default logger instance
const logger = new Logger();

export default logger;