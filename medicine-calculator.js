export class MedicineCalculator {
    static calculateSchedule(startTime, intervalHours, numberOfDoses) {
        const schedule = [];
        const [hours, minutes] = startTime.split(':').map(Number);
        
        let currentTime = new Date();
        currentTime.setHours(hours, minutes, 0, 0);
        
        for (let i = 0; i < numberOfDoses; i++) {
            const timeString = this.formatTime(currentTime);
            const dayOffset = this.getDayOffset(currentTime);
            
            schedule.push({
                time: timeString,
                dayOffset: dayOffset,
                displayText: this.getDisplayText(timeString, dayOffset)
            });
            
            currentTime.setHours(currentTime.getHours() + intervalHours);
        }
        
        return schedule;
    }
    
    static formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
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