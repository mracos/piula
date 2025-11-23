/**
 * Main application entry point
 */
import { MedicineCalculator } from './services/medicine-calculator.js';
import { CalendarView } from './components/calendar-view.js';
import { ExportModal } from './components/export-modal.js';
import { WheelPicker } from './components/wheel-picker.js';

class MedicineApp {
    constructor() {
        this.currentSchedule = null;
        this.cacheElements();
        this.initComponents();
        this.bindEvents();
        this.populateTotalPillsOptions();
        this.updateSchedule();
    }

    cacheElements() {
        this.startTimeInput = document.getElementById('startTime');
        this.intervalInput = document.getElementById('interval');
        this.daysInput = document.getElementById('days');
        this.pickerViewport = document.querySelector('.picker-viewport');
        this.pickerList = document.getElementById('totalPillsList');
        this.dailyHoursContainer = document.getElementById('dailyHours');
        this.calendarContainer = document.getElementById('calendar');
        this.exportButton = document.getElementById('exportCalendar');
        this.modal = document.getElementById('exportModal');
        this.eventTitleInput = document.getElementById('eventTitle');
    }

    initComponents() {
        this.calendarView = new CalendarView({
            dailyHoursContainer: this.dailyHoursContainer,
            calendarContainer: this.calendarContainer,
        });

        this.exportModal = new ExportModal({
            modal: this.modal,
            eventTitleInput: this.eventTitleInput,
            intervalInput: this.intervalInput,
            daysInput: this.daysInput,
        });

        this.wheelPicker = new WheelPicker({
            viewport: this.pickerViewport,
            list: this.pickerList,
            onSelect: (value, index) => {
                const days = index + 1;
                if (this.daysInput) {
                    this.daysInput.value = days;
                }
                this.updateSchedule();
            }
        });
    }

    bindEvents() {
        this.startTimeInput?.addEventListener('input', () => this.updateSchedule());

        this.intervalInput?.addEventListener('input', () => {
            this.populateTotalPillsOptions();
            this.updateSchedule();
        });

        this.daysInput?.addEventListener('input', () => {
            this.scrollPickerToCurrentDays();
            this.updateSchedule();
        });

        this.exportButton?.addEventListener('click', () => this.exportModal.open());
    }

    getDosesPerDay() {
        const interval = parseInt(this.intervalInput?.value, 10);
        if (Number.isNaN(interval) || interval < 1 || interval > 24) return 0;
        return Math.floor(24 / interval);
    }

    populateTotalPillsOptions() {
        const dosesPerDay = this.getDosesPerDay();
        if (dosesPerDay === 0) return;

        const currentDays = parseInt(this.daysInput?.value, 10) || 7;
        const currentTotal = currentDays * dosesPerDay;

        const options = [];
        for (let day = 1; day <= 30; day++) {
            const pills = day * dosesPerDay;
            options.push({ value: pills, label: String(pills) });
        }

        this.wheelPicker.populate(options, currentTotal);
    }

    scrollPickerToCurrentDays() {
        const days = parseInt(this.daysInput?.value, 10) || 7;
        const clampedDays = Math.max(1, Math.min(30, days));
        this.wheelPicker.scrollToIndex(clampedDays - 1);
    }

    updateSchedule() {
        const startTime = this.startTimeInput?.value;
        const interval = parseInt(this.intervalInput?.value, 10);
        const days = parseInt(this.daysInput?.value, 10);

        if (!this.inputsAreValid(startTime, interval, days)) {
            this.currentSchedule = null;
            this.calendarView.showEmptyStates();
            this.exportModal.setSchedule(null);
            return;
        }

        const result = MedicineCalculator.calculateSchedule(startTime, interval, days);
        this.currentSchedule = result.schedule;
        this.calendarView.render(result);
        this.exportModal.setSchedule(result.schedule);
    }

    inputsAreValid(startTime, interval, days) {
        if (!startTime || Number.isNaN(interval) || Number.isNaN(days)) {
            return false;
        }
        const intervalValid = interval >= 1 && interval <= 24;
        const daysValid = days >= 1 && days <= 30;
        return intervalValid && daysValid;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new MedicineApp();
});
