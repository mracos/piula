import { MedicineCalculator } from './medicine-calculator.js';

class MedicineApp {
    constructor() {
        this.startTimeInput = document.getElementById('startTime');
        this.intervalInput = document.getElementById('interval');
        this.daysInput = document.getElementById('days');
        this.dailyHoursContainer = document.getElementById('dailyHours');
        this.calendarContainer = document.getElementById('calendar');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateSchedule();
    }
    
    bindEvents() {
        this.startTimeInput.addEventListener('input', () => this.updateSchedule());
        this.intervalInput.addEventListener('input', () => this.updateSchedule());
        this.daysInput.addEventListener('input', () => this.updateSchedule());
    }
    
    updateSchedule() {
        const startTime = this.startTimeInput.value;
        const interval = parseInt(this.intervalInput.value);
        const days = parseInt(this.daysInput.value);
        
        if (!startTime || !interval || !days) {
            this.clearAll();
            return;
        }
        
        if (interval < 1 || interval > 24) {
            this.clearAll();
            return;
        }
        
        if (days < 1 || days > 30) {
            this.clearAll();
            return;
        }
        
        const result = MedicineCalculator.calculateSchedule(startTime, interval, days);
        this.renderDailyHours(result.dailyHours);
        this.renderCalendar(result.schedule);
    }
    
    renderDailyHours(dailyHours) {
        this.dailyHoursContainer.innerHTML = '';
        
        dailyHours.forEach(hour => {
            const badge = document.createElement('div');
            badge.className = 'hour-badge';
            badge.textContent = hour;
            this.dailyHoursContainer.appendChild(badge);
        });
    }
    
    renderCalendar(schedule) {
        const calendarData = MedicineCalculator.getCalendarData(schedule);
        this.calendarContainer.innerHTML = `
            <div class="calendar-wrapper">
                <h4 class="calendar-month-title">${calendarData.monthName}</h4>
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
        
        const grid = this.calendarContainer.querySelector('.calendar-days');
        
        calendarData.calendar.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day.day;
            
            if (!day.isCurrentMonth) {
                dayElement.classList.add('other-month');
            }
            if (day.isToday) {
                dayElement.classList.add('today');
            }
            if (day.hasMedicine) {
                dayElement.classList.add('has-medicine');
                
                if (day.medicineCount > 0) {
                    const dots = document.createElement('div');
                    dots.className = 'medicine-dots';
                    for (let i = 0; i < Math.min(day.medicineCount, 3); i++) {
                        const dot = document.createElement('div');
                        dot.className = 'medicine-dot';
                        dots.appendChild(dot);
                    }
                    dayElement.appendChild(dots);
                }
            }
            
            
            grid.appendChild(dayElement);
        });
        
        this.calendarContainer.appendChild(grid);
    }
    
    
    clearAll() {
        this.dailyHoursContainer.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 16px;">Enter valid values to see daily hours</div>';
        this.calendarContainer.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 16px;">Enter valid values to see calendar</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicineApp();
});