import { describe, it, expect } from 'vitest';
import {
    buildGoogleCalendarUrl,
    buildDailyRecurrenceRule,
    groupEventsByTime,
    getFirstDaySlots
} from '../js/services/export/google-calendar.js';

describe('buildGoogleCalendarUrl', () => {
    it('builds basic URL with required params', () => {
        const url = buildGoogleCalendarUrl({
            title: 'Test Event',
            startDate: new Date('2024-03-15T14:00:00Z'),
            endDate: new Date('2024-03-15T14:30:00Z'),
            details: 'Test details'
        });

        expect(url).toContain('calendar.google.com/calendar/render');
        expect(url).toContain('action=TEMPLATE');
        expect(url).toContain('text=Test%20Event');
        expect(url).toContain('details=Test%20details');
        expect(url).toContain('dates=20240315T140000Z/20240315T143000Z');
    });

    it('includes recurrence rule when provided', () => {
        const url = buildGoogleCalendarUrl({
            title: 'Daily Event',
            startDate: new Date('2024-03-15T14:00:00Z'),
            endDate: new Date('2024-03-15T14:30:00Z'),
            details: 'Repeating',
            recur: 'RRULE:FREQ=DAILY;COUNT=7'
        });

        expect(url).toContain('recur=');
        expect(url).toContain(encodeURIComponent('RRULE:FREQ=DAILY;COUNT=7'));
    });
});

describe('buildDailyRecurrenceRule', () => {
    it('builds rule with count', () => {
        const rule = buildDailyRecurrenceRule(7, null);
        expect(rule).toBe('RRULE:FREQ=DAILY;COUNT=7');
    });

    it('builds rule with until date when no count', () => {
        const until = new Date('2024-03-22T00:00:00Z');
        const rule = buildDailyRecurrenceRule(0, until);
        expect(rule).toContain('UNTIL=20240322T000000Z');
    });

    it('prefers count over until', () => {
        const until = new Date('2024-03-22T00:00:00Z');
        const rule = buildDailyRecurrenceRule(5, until);
        expect(rule).toContain('COUNT=5');
        expect(rule).not.toContain('UNTIL');
    });
});

describe('groupEventsByTime', () => {
    it('groups events by hour:minute', () => {
        const schedule = [
            { date: new Date('2024-03-15T08:00:00') },
            { date: new Date('2024-03-16T08:00:00') },
            { date: new Date('2024-03-15T20:00:00') }
        ];

        const groups = groupEventsByTime(schedule);

        expect(groups.size).toBe(2);
        expect(groups.get('8:0').length).toBe(2);
        expect(groups.get('20:0').length).toBe(1);
    });
});

describe('getFirstDaySlots', () => {
    it('returns slots within first 24 hours', () => {
        const firstEvent = new Date('2024-03-15T08:00:00');
        const slots = new Map();
        slots.set('8:0', [
            { date: new Date('2024-03-15T08:00:00') },
            { date: new Date('2024-03-16T08:00:00') }
        ]);
        slots.set('20:0', [
            { date: new Date('2024-03-15T20:00:00') }
        ]);

        const result = getFirstDaySlots(firstEvent, slots);

        expect(result.length).toBe(2);
        expect(result[0].slotKey).toBe('8:0');
        expect(result[1].slotKey).toBe('20:0');
    });

    it('sorts by event time', () => {
        const firstEvent = new Date('2024-03-15T20:00:00');
        const slots = new Map();
        slots.set('20:0', [{ date: new Date('2024-03-15T20:00:00') }]);
        slots.set('8:0', [{ date: new Date('2024-03-16T08:00:00') }]);

        const result = getFirstDaySlots(firstEvent, slots);

        expect(result[0].slotKey).toBe('20:0');
    });
});
