import { describe, it, expect } from 'vitest';
import { buildCalendarICS } from '../js/services/export/ics-generator.js';

describe('buildCalendarICS', () => {
    it('generates valid ICS structure', () => {
        const schedule = [
            { date: new Date('2024-03-15T08:00:00Z') },
            { date: new Date('2024-03-15T16:00:00Z') }
        ];

        const ics = buildCalendarICS(schedule, 'Take Medication');

        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('END:VCALENDAR');
        expect(ics).toContain('VERSION:2.0');
        expect(ics).toContain('PRODID:-//Piula//Medication Schedule//EN');
    });

    it('creates event for each schedule item', () => {
        const schedule = [
            { date: new Date('2024-03-15T08:00:00Z') },
            { date: new Date('2024-03-15T16:00:00Z') },
            { date: new Date('2024-03-16T08:00:00Z') }
        ];

        const ics = buildCalendarICS(schedule, 'Test');

        const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
        expect(eventCount).toBe(3);
    });

    it('includes event title', () => {
        const schedule = [{ date: new Date('2024-03-15T08:00:00Z') }];

        const ics = buildCalendarICS(schedule, 'My Custom Title');

        expect(ics).toContain('SUMMARY:My Custom Title');
    });

    it('includes alarm with 15 minute trigger', () => {
        const schedule = [{ date: new Date('2024-03-15T08:00:00Z') }];

        const ics = buildCalendarICS(schedule, 'Test');

        expect(ics).toContain('BEGIN:VALARM');
        expect(ics).toContain('TRIGGER:-PT15M');
        expect(ics).toContain('END:VALARM');
    });

    it('includes dose count in description', () => {
        const schedule = [
            { date: new Date('2024-03-15T08:00:00Z') },
            { date: new Date('2024-03-15T16:00:00Z') }
        ];

        const ics = buildCalendarICS(schedule, 'Test');

        expect(ics).toContain('dose 1 of 2');
        expect(ics).toContain('dose 2 of 2');
    });

    it('uses CRLF line endings', () => {
        const schedule = [{ date: new Date('2024-03-15T08:00:00Z') }];

        const ics = buildCalendarICS(schedule, 'Test');

        expect(ics).toContain('\r\n');
    });
});
