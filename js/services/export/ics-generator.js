/**
 * ICS file generator for calendar exports
 */
import { formatICSDate } from '../../utils/date-utils.js';

/**
 * Build ICS calendar content
 * @param {Array} schedule - Array of schedule events
 * @param {string} title - Event title
 * @returns {string} ICS file content
 */
export function buildCalendarICS(schedule, title) {
    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Piula//Medication Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Medication Schedule',
        'X-WR-TIMEZONE:UTC',
    ];

    const timestamp = formatICSDate(new Date());

    schedule.forEach((event, index) => {
        const startDate = formatICSDate(event.date);
        const endDate = formatICSDate(event.date);
        content.push(
            'BEGIN:VEVENT',
            `UID:${timestamp}-${index}@piula`,
            `DTSTAMP:${timestamp}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:Medication reminder (dose ${index + 1} of ${schedule.length})`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'BEGIN:VALARM',
            'TRIGGER:-PT15M',
            'DESCRIPTION:Medication Reminder',
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VEVENT'
        );
    });

    content.push('END:VCALENDAR');
    return content.join('\r\n');
}

/**
 * Download text content as a file
 * @param {string} content - File content
 * @param {string} filename - Filename to save as
 * @param {string} mime - MIME type
 */
export function downloadTextFile(content, filename, mime = 'text/calendar;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
