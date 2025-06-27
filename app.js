import { MedicineCalculator } from './medicine-calculator.js';

class MedicineApp {
    constructor() {
        this.startTimeInput = document.getElementById('startTime');
        this.intervalInput = document.getElementById('interval');
        this.dosesInput = document.getElementById('doses');
        this.scheduleList = document.getElementById('scheduleList');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateSchedule();
    }
    
    bindEvents() {
        this.startTimeInput.addEventListener('input', () => this.updateSchedule());
        this.intervalInput.addEventListener('input', () => this.updateSchedule());
        this.dosesInput.addEventListener('input', () => this.updateSchedule());
    }
    
    updateSchedule() {
        const startTime = this.startTimeInput.value;
        const interval = parseInt(this.intervalInput.value);
        const doses = parseInt(this.dosesInput.value);
        
        if (!startTime || !interval || !doses) {
            this.clearSchedule();
            return;
        }
        
        if (interval < 1 || interval > 24) {
            this.clearSchedule();
            return;
        }
        
        if (doses < 1 || doses > 10) {
            this.clearSchedule();
            return;
        }
        
        const schedule = MedicineCalculator.calculateSchedule(startTime, interval, doses);
        this.renderSchedule(schedule);
    }
    
    renderSchedule(schedule) {
        this.scheduleList.innerHTML = '';
        
        schedule.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `Dose ${index + 1}: ${item.displayText}`;
            this.scheduleList.appendChild(li);
        });
    }
    
    clearSchedule() {
        this.scheduleList.innerHTML = '<li style="color: #9ca3af; font-style: italic;">Enter valid values to see your schedule</li>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MedicineApp();
});