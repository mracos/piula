import { describe, it, expect } from 'vitest';
import { MedicineCalculator } from '../js/services/medicine-calculator.js';

describe('MedicineCalculator.calculateSchedule', () => {
    it('calculates correct number of doses', () => {
        const result = MedicineCalculator.calculateSchedule('08:00', 8, 7);

        // 24/8 = 3 doses per day, 7 days = 21 doses
        expect(result.schedule.length).toBe(21);
    });

    it('returns daily hours', () => {
        const result = MedicineCalculator.calculateSchedule('08:00', 8, 3);

        expect(result.dailyHours).toContain('08:00');
        expect(result.dailyHours).toContain('16:00');
        // 08:00 + 8h = 16:00, 16:00 + 8h = 00:00 (next day)
        expect(result.dailyHours.length).toBeGreaterThanOrEqual(2);
    });

    it('schedule items have required properties', () => {
        const result = MedicineCalculator.calculateSchedule('20:00', 12, 2);
        const item = result.schedule[0];

        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('dayOffset');
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('displayText');
        expect(item).toHaveProperty('isToday');
    });

    it('handles every 6 hours schedule', () => {
        const result = MedicineCalculator.calculateSchedule('06:00', 6, 1);

        // 24/6 = 4 doses per day
        expect(result.schedule.length).toBe(4);
    });
});

describe('MedicineCalculator.generateCalendar', () => {
    it('generates 42 days (6 weeks)', () => {
        const calendar = MedicineCalculator.generateCalendar(2024, 2, []);

        expect(calendar.length).toBe(42);
    });

    it('marks medicine days correctly', () => {
        const medicineDates = [
            new Date(2024, 2, 15),
            new Date(2024, 2, 15),
            new Date(2024, 2, 16)
        ];

        const calendar = MedicineCalculator.generateCalendar(2024, 2, medicineDates);
        const march15 = calendar.find(d => d.day === 15 && d.isCurrentMonth);

        expect(march15.hasMedicine).toBe(true);
        expect(march15.medicineCount).toBe(2);
    });

    it('identifies current month days', () => {
        const calendar = MedicineCalculator.generateCalendar(2024, 2, []);
        const marchDays = calendar.filter(d => d.isCurrentMonth);

        expect(marchDays.length).toBe(31); // March has 31 days
    });
});

describe('MedicineCalculator.getCalendarData', () => {
    it('returns calendar and month name', () => {
        const schedule = [{ date: new Date(2024, 2, 15) }];
        const data = MedicineCalculator.getCalendarData(schedule, 2024, 2);

        expect(data.calendar).toBeDefined();
        expect(data.monthName).toContain('March');
        expect(data.monthName).toContain('2024');
    });
});

describe('MedicineCalculator.getDayOffset', () => {
    it('returns 0 for today', () => {
        const today = new Date();
        const offset = MedicineCalculator.getDayOffset(today);

        expect(offset).toBe(0);
    });

    it('returns positive for future dates', () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const offset = MedicineCalculator.getDayOffset(tomorrow);
        expect(offset).toBe(1);
    });

    it('returns negative for past dates', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const offset = MedicineCalculator.getDayOffset(yesterday);
        expect(offset).toBe(-1);
    });
});

describe('MedicineCalculator.getDisplayText', () => {
    it('shows Today for offset 0', () => {
        const text = MedicineCalculator.getDisplayText('08:00', 0);
        expect(text).toContain('Today');
    });

    it('shows Tomorrow for offset 1', () => {
        const text = MedicineCalculator.getDisplayText('08:00', 1);
        expect(text).toContain('Tomorrow');
    });

    it('shows days ago for negative offset', () => {
        const text = MedicineCalculator.getDisplayText('08:00', -2);
        expect(text).toContain('2 days ago');
    });

    it('shows In X days for future', () => {
        const text = MedicineCalculator.getDisplayText('08:00', 5);
        expect(text).toContain('In 5 days');
    });
});
