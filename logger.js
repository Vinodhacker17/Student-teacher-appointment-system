/**
 * Simple structured logger for the application.
 * Replaces console.log and alert for consistent, trackable logging.
 *
 * @param {string} level - The log level (e.g., 'INFO', 'ERROR', 'WARN').
 * @param {string} message - The primary log message.
 * @param {object} [data={}] - Optional data object to include with the log.
 */
export const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data,
  };

  // In a real production app, this could send logs to a service.
  // For this project, console logging is sufficient to demonstrate the principle.
  if (level === 'ERROR') {
    console.error(`[${level}] - ${timestamp}: ${message}`, data);
  } else {
    console.log(`[${level}] - ${timestamp}: ${message}`, data);
  }
};