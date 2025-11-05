/**
 * Date utility functions for consistent date handling across the application
 * 
 * IMPORTANT: Always use getLocalDateString() instead of new Date().toISOString().split('T')[0]
 * to avoid timezone issues when comparing dates with database records.
 */

/**
 * Get the current date as a string in YYYY-MM-DD format using local timezone
 * This ensures consistency with database records that are stored in local time
 * 
 * @returns Date string in YYYY-MM-DD format (e.g., "2025-11-04")
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the current date and time as ISO string
 * 
 * @returns ISO string (e.g., "2025-11-04T00:32:37.000Z")
 */
export const getISOString = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * Format a date object to a readable string
 * 
 * @param date Date object to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a date object to a readable time string
 * 
 * @param date Date object to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  return date.toLocaleTimeString('en-US', options || { hour: '2-digit', minute: '2-digit', hour12: true });
};
