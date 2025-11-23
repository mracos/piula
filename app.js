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
        this.isScrolling = false;
        this.scrollTimeout = null;
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

        this.pickerViewport?.addEventListener('scroll', () => this.handlePickerScroll());

        this.exportButton?.addEventListener('click', () => this.exportModal.open());
    }

    getDosesPerDay() {
        const interval = parseInt(this.intervalInput?.value, 10);
        if (Number.isNaN(interval) || interval < 1 || interval > 24) return 0;
        return Math.floor(24 / interval);
    }

    populateTotalPillsOptions() {
        if (!this.pickerList) return;
        const dosesPerDay = this.getDosesPerDay();
        if (dosesPerDay === 0) return;

        this.pickerList.innerHTML = '';
        for (let day = 1; day <= 30; day++) {
            const pills = day * dosesPerDay;
            const item = document.createElement('div');
            item.className = 'picker-item';
            item.dataset.days = day;
            item.dataset.pills = pills;
            item.textContent = pills;
            item.addEventListener('click', () => this.selectPickerItem(day));
            this.pickerList.appendChild(item);
        }

        // Wait for DOM to render before scrolling
        requestAnimationFrame(() => {
            this.scrollPickerToCurrentDays(false);
        });
    }

    scrollPickerToCurrentDays(smooth = true) {
        const days = parseInt(this.daysInput?.value, 10) || 7;
        const clampedDays = Math.max(1, Math.min(30, days));
        const itemHeight = 40;
        const targetScroll = (clampedDays - 1) * itemHeight;

        if (this.pickerViewport) {
            this.isScrolling = true;
            if (smooth) {
                this.pickerViewport.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    this.isScrolling = false;
                    this.updatePickerSelection();
                }, 300);
            } else {
                this.pickerViewport.scrollTop = targetScroll;
                this.isScrolling = false;
                this.updatePickerSelection();
            }
        }
    }

    handlePickerScroll() {
        if (this.isScrolling) return;

        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.updatePickerSelection();
            this.updateDaysFromPicker();
        }, 100);
    }

    updatePickerSelection() {
        if (!this.pickerViewport || !this.pickerList) return;

        const itemHeight = 40;
        const scrollTop = this.pickerViewport.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight);

        this.pickerList.querySelectorAll('.picker-item').forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    selectPickerItem(day) {
        if (this.daysInput) {
            this.daysInput.value = day;
        }
        this.scrollPickerToCurrentDays();
        this.updateSchedule();
    }

    updateDaysFromPicker() {
        if (!this.pickerViewport) return;

        const itemHeight = 40;
        const scrollTop = this.pickerViewport.scrollTop;
        const selectedIndex = Math.round(scrollTop / itemHeight);
        const days = selectedIndex + 1;

        if (this.daysInput && days >= 1 && days <= 30) {
            this.daysInput.value = days;
            this.updateSchedule();
        }
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
