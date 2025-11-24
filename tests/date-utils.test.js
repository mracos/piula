import { describe, it, expect } from 'vitest';
import { formatICSDate, formatGoogleDate, formatTime } from '../js/utils/date-utils.js';

describe('formatICSDate', () => {
    it('formats date to ICS format', () => {
        const date = new Date('2024-03-15T14:30:00Z');
        expect(formatICSDate(date)).toBe('20240315T143000Z');
    });

    it('removes dashes and colons', () => {
        const date = new Date('2024-01-01T00:00:00Z');
        const result = formatICSDate(date);
        expect(result).not.toContain('-');
        expect(result).not.toContain(':');
    });
});

describe('formatGoogleDate', () => {
    it('formats date same as ICS format', () => {
        const date = new Date('2024-03-15T14:30:00Z');
        expect(formatGoogleDate(date)).toBe('20240315T143000Z');
    });
});

describe('formatTime', () => {
    it('formats Date object to 24-hour time', () => {
        const date = new Date('2024-03-15T14:30:00');
        expect(formatTime(date)).toBe('14:30');
    });

    it('handles timestamp number', () => {
        const timestamp = new Date('2024-03-15T08:00:00').getTime();
        expect(formatTime(timestamp)).toBe('08:00');
    });

    it('formats midnight correctly', () => {
        const date = new Date('2024-03-15T00:00:00');
        // toLocaleTimeString with hour12:false can return '24:00' or '00:00' depending on locale
        const result = formatTime(date);
        expect(result === '00:00' || result === '24:00').toBe(true);
    });
});
