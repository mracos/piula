/**
 * Calendar view component for displaying schedule
 */
import { MedicineCalculator } from '../services/medicine-calculator.js';

export class CalendarView {
    constructor({ dailyHoursContainer, calendarContainer }) {
        this.dailyHoursContainer = dailyHoursContainer;
        this.calendarContainer = calendarContainer;
        this.currentCalendarDate = new Date();
        this.currentSchedule = null;
    }

    render({ dailyHours, schedule }) {
        this.currentSchedule = schedule;
        this.renderDailyHours(dailyHours);
        this.renderCalendar();
    }

    showEmptyStates() {
        if (this.dailyHoursContainer) {
            this.dailyHoursContainer.innerHTML = '<div class="empty-state">Enter valid values to see daily hours</div>';
        }
        if (this.calendarContainer) {
            this.calendarContainer.innerHTML = '<div class="empty-state">Enter valid values to see calendar</div>';
        }
        this.currentSchedule = null;
    }

    renderDailyHours(dailyHours) {
        if (!this.dailyHoursContainer) return;
        this.dailyHoursContainer.innerHTML = '';
        dailyHours.forEach((hour) => {
            const badge = document.createElement('div');
            badge.className = 'hour-badge';
            badge.textContent = hour;
            this.dailyHoursContainer.appendChild(badge);
        });
    }

    renderCalendar() {
        if (!this.calendarContainer || !this.currentSchedule) return;

        const calendarData = MedicineCalculator.getCalendarData(
            this.currentSchedule,
            this.currentCalendarDate.getFullYear(),
            this.currentCalendarDate.getMonth()
        );

        this.calendarContainer.innerHTML = `
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="prevMonth">‹</button>
                    <h4 class="calendar-month-title">${calendarData.monthName}</h4>
                    <button class="calendar-nav-btn" id="nextMonth">›</button>
                </div>
                <div class="calendar-weekdays">
                    <div class="weekday">Sun</div>
                    <div class="weekday">Mon</div>
                    <div class="weekday">Tue</div>
                    <div class="weekday">Wed</div>
                    <div class="weekday">Thu</div>
                    <div class="weekday">Fri</div>
                    <div class="weekday">Sat</div>
                </div>
                <div class="calendar-days"></div>
            </div>
        `;

        this.bindNavigation();
        this.populateCalendarDays(calendarData.calendar);
    }

    bindNavigation() {
        const prevBtn = this.calendarContainer.querySelector('#prevMonth');
        const nextBtn = this.calendarContainer.querySelector('#nextMonth');

        prevBtn?.addEventListener('click', () => this.navigateMonth(-1));
        nextBtn?.addEventListener('click', () => this.navigateMonth(1));
    }

    populateCalendarDays(days) {
        const grid = this.calendarContainer.querySelector('.calendar-days');
        if (!grid) return;

        grid.innerHTML = '';
        days.forEach((day) => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day.day;

            if (!day.isCurrentMonth) dayElement.classList.add('other-month');
            if (day.isToday) dayElement.classList.add('today');
            if (day.hasMedicine) {
                dayElement.classList.add('has-medicine');
                this.addMedicineDots(dayElement, day.medicineCount);
            }

            grid.appendChild(dayElement);
        });
    }

    addMedicineDots(dayElement, count) {
        if (!count) return;
        const dots = document.createElement('div');
        dots.className = 'medicine-dots';
        const dotCount = Math.min(count, 3);

        for (let i = 0; i < dotCount; i += 1) {
            const dot = document.createElement('div');
            dot.className = 'medicine-dot';
            dots.appendChild(dot);
        }

        dayElement.appendChild(dots);
    }

    navigateMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        if (this.currentSchedule) {
            this.renderCalendar();
        }
    }
}
