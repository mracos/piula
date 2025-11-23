/**
 * Google Calendar URL builder
 */
import { formatGoogleDate, formatRangeLabel } from '../../utils/date-utils.js';

/**
 * Build Google Calendar event URL
 * @param {Object} params
 * @param {string} params.title
 * @param {Date} params.startDate
 * @param {Date} params.endDate
 * @param {string} params.details
 * @param {string} [params.recur] - RRULE string
 * @returns {string}
 */
export function buildGoogleCalendarUrl({ title, startDate, endDate, details, recur }) {
    const encodedTitle = encodeURIComponent(title);
    const encodedDetails = encodeURIComponent(details);
    const start = formatGoogleDate(startDate);
    const end = formatGoogleDate(endDate);

    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDetails}&dates=${start}/${end}`;

    if (recur) {
        url += `&recur=${encodeURIComponent(recur)}`;
    }

    return url;
}

/**
 * Build recurrence rule for daily events
 * @param {number} count - Number of occurrences
 * @param {Date} untilDate - End date
 * @returns {string}
 */
export function buildDailyRecurrenceRule(count, untilDate) {
    const parts = ['RRULE:FREQ=DAILY'];

    if (Number.isFinite(count) && count > 0) {
        parts.push(`COUNT=${count}`);
    } else if (untilDate instanceof Date) {
        parts.push(`UNTIL=${formatGoogleDate(untilDate)}`);
    }

    return parts.join(';');
}

/**
 * Group schedule events by time slot
 * @param {Array} schedule
 * @returns {Map}
 */
export function groupEventsByTime(schedule) {
    const slots = new Map();
    schedule.forEach((event) => {
        const key = `${event.date.getHours()}:${event.date.getMinutes()}`;
        if (!slots.has(key)) {
            slots.set(key, []);
        }
        slots.get(key).push(event);
    });
    return slots;
}

/**
 * Get unique time slots from first day
 * @param {Date} firstEventDate
 * @param {Map} slotOccurrences
 * @returns {Array}
 */
export function getFirstDaySlots(firstEventDate, slotOccurrences) {
    const oneDayLater = new Date(firstEventDate.getTime() + 24 * 60 * 60 * 1000);
    const uniqueSlots = [];
    const seen = new Set();

    slotOccurrences.forEach((events, slotKey) => {
        const firstOccurrence = events[0];
        if (firstOccurrence.date < oneDayLater && !seen.has(slotKey)) {
            uniqueSlots.push({ slotKey, event: firstOccurrence });
            seen.add(slotKey);
        }
    });

    uniqueSlots.sort((a, b) => a.event.date - b.event.date);
    return uniqueSlots;
}

/**
 * Generate Google Calendar link data for a time slot
 * @param {Object} params
 * @returns {Object}
 */
export function generateGoogleLinkData({ title, event, occurrences }) {
    const lastOccurrence = occurrences[occurrences.length - 1];
    const slotCount = occurrences.length;

    let recur = null;
    if (slotCount > 1) {
        recur = buildDailyRecurrenceRule(slotCount, lastOccurrence.date);
    }

    const url = buildGoogleCalendarUrl({
        title,
        startDate: event.date,
        endDate: event.date,
        details: 'Medication reminder',
        recur
    });

    const timeLabel = event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const rangeLabel = formatRangeLabel(occurrences[0].date, lastOccurrence.date);
    const doseLabel = slotCount === 1 ? '1 dose total' : `${slotCount} doses total`;

    return {
        url,
        timeLabel,
        rangeLabel,
        doseLabel,
        slotCount
    };
}
