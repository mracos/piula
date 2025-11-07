import { MedicineCalculator } from './medicine-calculator.js';
import { CalendarView } from './calendar-view.js';
import { ExportModal } from './export-modal.js';

class MedicineApp {
    constructor() {
        this.currentSchedule = null;
        this.cacheElements();
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
        this.bindEvents();
        this.updateSchedule();
    }

    cacheElements() {
        this.startTimeInput = document.getElementById('startTime');
        this.intervalInput = document.getElementById('interval');
        this.daysInput = document.getElementById('days');
        this.dailyHoursContainer = document.getElementById('dailyHours');
        this.calendarContainer = document.getElementById('calendar');
        this.exportButton = document.getElementById('exportCalendar');
        this.modal = document.getElementById('exportModal');
        this.eventTitleInput = document.getElementById('eventTitle');
    }

    bindEvents() {
        [this.startTimeInput, this.intervalInput, this.daysInput].forEach((input) => {
            input?.addEventListener('input', () => this.updateSchedule());
        });

        this.exportButton?.addEventListener('click', () => this.exportModal.open());
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
