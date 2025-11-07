export function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function buildCalendarICS(schedule, title) {
    const content = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Piula//Medication Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Medication Schedule',
        'X-WR-TIMEZONE:UTC',
    ];

    const timestamp = formatICSDate(new Date());

    schedule.forEach((event, index) => {
        const startDate = formatICSDate(event.date);
        const endDate = formatICSDate(event.date);
        content.push(
            'BEGIN:VEVENT',
            `UID:${timestamp}-${index}@piula`,
            `DTSTAMP:${timestamp}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${title}`,
            `DESCRIPTION:Medication reminder (dose ${index + 1} of ${schedule.length})`,
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'BEGIN:VALARM',
            'TRIGGER:-PT15M',
            'DESCRIPTION:Medication Reminder',
            'ACTION:DISPLAY',
            'END:VALARM',
            'END:VEVENT'
        );
    });

    content.push('END:VCALENDAR');
    return content.join('\r\n');
}

export function downloadTextFile(content, filename, mime = 'text/calendar;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
