export class MedicineCalculator {
    static calculateSchedule(startTime, intervalHours, numberOfDays) {
        const schedule = [];
        const dailyHours = [];
        const [hours, minutes] = startTime.split(':').map(Number);
        
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);
        
        const hoursPerDay = Math.floor(24 / intervalHours);
        const totalDoses = numberOfDays * hoursPerDay;
        
        for (let i = 0; i < totalDoses; i++) {
            const timeString = this.formatTime(currentTime);
            const dayOffset = this.getDayOffset(currentTime);
            const date = new Date(currentTime);
            
            schedule.push({
                time: timeString,
                dayOffset: dayOffset,
                date: date,
                displayText: this.getDisplayText(timeString, dayOffset),
                isToday: dayOffset === 0
            });
            
            currentTime.setHours(currentTime.getHours() + intervalHours);
        }
        
        for (let hour = hours; hour < 24; hour += intervalHours) {
            dailyHours.push(this.formatTime(new Date().setHours(hour, minutes, 0, 0)));
        }
        
        if (hours + intervalHours >= 24) {
            for (let hour = (hours + intervalHours) % 24; hour < hours; hour += intervalHours) {
                if (hour >= 0) {
                    dailyHours.push(this.formatTime(new Date().setHours(hour, minutes, 0, 0)));
                }
            }
        }
        
        return {
            schedule,
            dailyHours: dailyHours.sort()
        };
    }
    
    static formatTime(date) {
        if (typeof date === 'number') {
            date = new Date(date);
        }
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    static generateCalendar(year, month, medicineDates) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendar = [];
        const today = new Date();
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateStr = currentDate.toDateString();
            const medicineCount = medicineDates.filter(d => 
                d.toDateString() === dateStr
            ).length;
            
            calendar.push({
                date: currentDate,
                day: currentDate.getDate(),
                isCurrentMonth: currentDate.getMonth() === month,
                isToday: currentDate.toDateString() === today.toDateString(),
                hasMedicine: medicineCount > 0,
                medicineCount: medicineCount
            });
        }
        
        return calendar;
    }
    
    static getCalendarData(schedule, year = null, month = null) {
        const today = new Date();
        const targetYear = year !== null ? year : today.getFullYear();
        const targetMonth = month !== null ? month : today.getMonth();
        
        const medicineDates = schedule.map(item => item.date);
        
        return {
            calendar: this.generateCalendar(targetYear, targetMonth, medicineDates),
            monthName: new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long', year: 'numeric' })
        };
    }
    
    static getDayOffset(time) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const timeDate = new Date(time.getFullYear(), time.getMonth(), time.getDate());
        
        const diffTime = timeDate - today;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    static getDisplayText(timeString, dayOffset) {
        if (dayOffset === 0) {
            return `${timeString} (Today)`;
        } else if (dayOffset === 1) {
            return `${timeString} (Tomorrow)`;
        } else if (dayOffset === -1) {
            return `${timeString} (Yesterday)`;
        } else if (dayOffset > 1) {
            return `${timeString} (In ${dayOffset} days)`;
        } else {
            return `${timeString} (${Math.abs(dayOffset)} days ago)`;
        }
    }
}