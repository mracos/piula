import { MedicineCalculator } from './medicine-calculator.js';

class MedicineApp {
    constructor() {
        this.startTimeInput = document.getElementById('startTime');
        this.intervalInput = document.getElementById('interval');
        this.daysInput = document.getElementById('days');
        this.dailyHoursContainer = document.getElementById('dailyHours');
        this.calendarContainer = document.getElementById('calendar');
        this.timelineContainer = document.getElementById('timeline');
        
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
        this.renderTimeline(result.schedule);
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
        this.calendarContainer.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'calendar-header';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-header-day';
            dayElement.textContent = day;
            header.appendChild(dayElement);
        });
        this.calendarContainer.appendChild(header);
        
        const monthTitle = document.createElement('h4');
        monthTitle.textContent = calendarData.monthName;
        monthTitle.style.marginBottom = '12px';
        monthTitle.style.color = '#374151';
        monthTitle.style.fontWeight = '600';
        this.calendarContainer.insertBefore(monthTitle, header);
        
        const grid = document.createElement('div');
        grid.className = 'calendar';
        
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
    
    renderTimeline(schedule) {
        this.timelineContainer.innerHTML = '';
        
        schedule.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            
            const dateElement = document.createElement('div');
            dateElement.className = 'timeline-date';
            dateElement.textContent = item.date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            const timeElement = document.createElement('div');
            timeElement.className = 'timeline-time';
            if (item.isToday) {
                timeElement.classList.add('today');
            }
            timeElement.textContent = item.time;
            
            timelineItem.appendChild(dateElement);
            timelineItem.appendChild(timeElement);
            this.timelineContainer.appendChild(timelineItem);
        });
    }
    
    clearAll() {
        this.dailyHoursContainer.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 16px;">Enter valid values to see daily hours</div>';
        this.calendarContainer.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 16px;">Enter valid values to see calendar</div>';
        this.timelineContainer.innerHTML = '<div style="color: #9ca3af; font-style: italic; padding: 16px;">Enter valid values to see timeline</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicineApp();
});