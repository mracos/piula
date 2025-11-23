/**
 * Date utility functions for formatting dates across the app
 */

/**
 * Format date for ICS files (ISO format without separators)
 * @param {Date} date
 * @returns {string} e.g., "20231123T200000Z"
 */
export function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Format date for Google Calendar URL
 * @param {Date} date
 * @returns {string} e.g., "20231123T200000Z"
 */
export function formatGoogleDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Format time for display (24-hour format)
 * @param {Date|number} date
 * @returns {string} e.g., "20:00"
 */
export function formatTime(date) {
    if (typeof date === 'number') {
        date = new Date(date);
    }
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

/**
 * Format date for display
 * @param {Date} date
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(date, options = { weekday: 'short', month: 'short', day: 'numeric' }) {
    return date.toLocaleDateString([], options);
}

/**
 * Format date range label
 * @param {Date} start
 * @param {Date} end
 * @returns {string}
 */
export function formatRangeLabel(start, end) {
    const startLabel = `${formatDate(start, { month: 'short', day: 'numeric' })} · ${formatTime(start)}`;
    const endLabel = `${formatDate(end, { month: 'short', day: 'numeric' })} · ${formatTime(end)}`;
    return `${startLabel} → ${endLabel}`;
}
