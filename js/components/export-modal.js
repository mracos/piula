/**
 * Export modal component for calendar exports
 */
import { buildCalendarICS, downloadTextFile } from '../services/export/ics-generator.js';
import {
    groupEventsByTime,
    getFirstDaySlots,
    generateGoogleLinkData
} from '../services/export/google-calendar.js';

export class ExportModal {
    constructor({ modal, eventTitleInput, intervalInput, daysInput }) {
        this.modal = modal;
        this.eventTitleInput = eventTitleInput;
        this.intervalInput = intervalInput;
        this.daysInput = daysInput;

        this.modalCloseBtn = document.getElementById('closeModal');
        this.modalHeaderBackBtn = document.getElementById('modalHeaderBack');
        this.modalOptionsView = document.getElementById('calendarOptionsView');
        this.googleLinksView = document.getElementById('googleLinksView');
        this.googleLinksList = document.getElementById('googleLinksList');
        this.googleSummary = document.getElementById('googleSummary');
        this.googleExplanation = document.getElementById('googleExplanation');
        this.googleWarning = document.getElementById('googleWarning');
        this.exportGoogleBtn = document.getElementById('exportGoogle');
        this.exportICSBtn = document.getElementById('exportICS');
        this.schedule = [];

        this.bindEvents();
    }

    bindEvents() {
        this.modalCloseBtn?.addEventListener('click', () => this.close());
        this.modal?.addEventListener('click', (event) => {
            if (event.target === this.modal) this.close();
        });

        this.exportGoogleBtn?.addEventListener('click', () => this.openGoogleLinks());
        this.exportICSBtn?.addEventListener('click', () => this.exportToICS());

        const handleBack = () => {
            this.resetGoogleLinksView();
            this.showOptions();
        };

        this.backToOptionsBtn?.addEventListener('click', handleBack);
        this.modalHeaderBackBtn?.addEventListener('click', handleBack);
    }

    setSchedule(schedule) {
        this.schedule = Array.isArray(schedule) ? schedule : [];
    }

    open() {
        if (!this.ensureSchedule()) return;
        this.resetGoogleLinksView();
        this.showOptions();
        this.modal?.classList.add('active');
    }

    close() {
        this.resetGoogleLinksView();
        this.showOptions();
        this.modal?.classList.remove('active');
    }

    showOptions() {
        this.toggleHeaderBack(false);
        this.modalOptionsView?.classList.add('active');
        this.googleLinksView?.classList.remove('active');
    }

    showGoogleView() {
        this.toggleHeaderBack(true);
        this.modalOptionsView?.classList.remove('active');
        this.googleLinksView?.classList.add('active');
    }

    toggleHeaderBack(show) {
        if (!this.modalHeaderBackBtn) return;
        if (show) {
            this.modalHeaderBackBtn.classList.add('active');
        } else {
            this.modalHeaderBackBtn.classList.remove('active');
        }
    }

    ensureSchedule() {
        if (!this.schedule || this.schedule.length === 0) {
            alert('Please set your medication schedule first.');
            return false;
        }
        return true;
    }

    resetGoogleLinksView() {
        if (this.googleLinksList) this.googleLinksList.innerHTML = '';
        if (this.googleSummary) this.googleSummary.innerHTML = '';
        if (this.googleExplanation) this.googleExplanation.innerHTML = '';
        if (this.googleWarning) {
            this.googleWarning.hidden = true;
            this.googleWarning.textContent = '';
        }
    }

    openGoogleLinks() {
        if (!this.ensureSchedule()) return;
        this.showGoogleView();
        if (!this.googleLinksList) return;

        this.resetGoogleLinksView();

        const schedule = this.schedule;
        const firstEvent = schedule[0].date;
        const lastEvent = schedule[schedule.length - 1].date;
        const interval = parseInt(this.intervalInput?.value, 10);
        const days = parseInt(this.daysInput?.value, 10);

        const slotOccurrences = groupEventsByTime(schedule);
        const firstDaySlots = getFirstDaySlots(firstEvent, slotOccurrences);

        if (!firstDaySlots.length) {
            this.googleLinksList.innerHTML = '<p class="google-empty">Could not generate quick links. Please use the .ics download instead.</p>';
            return;
        }

        this.renderGoogleSummary(firstEvent, lastEvent, interval, days, schedule.length);
        this.renderGoogleExplanation();
        this.renderGoogleWarning(interval);
        this.renderGoogleLinks(firstDaySlots, slotOccurrences);
    }

    renderGoogleSummary(firstEvent, lastEvent, interval, days, totalOccurrences) {
        if (!this.googleSummary) return;
        const repeatParts = [];
        if (Number.isFinite(interval) && interval > 0) repeatParts.push(`Every ${interval}h`);
        if (Number.isFinite(days) && days > 0) repeatParts.push(`${days} day${days === 1 ? '' : 's'}`);
        const repeatLabel = repeatParts.length ? repeatParts.join(' · ') : 'Custom cadence';

        const startLabel = `${firstEvent.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${firstEvent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const endLabel = `${lastEvent.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;

        this.googleSummary.innerHTML = `
            <div class="summary-row">
                <div class="summary-item">
                    <span class="summary-label">Starts</span>
                    <span class="summary-value">${startLabel}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Ends</span>
                    <span class="summary-value">${endLabel}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Repeats</span>
                    <span class="summary-value">${repeatLabel}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Doses</span>
                    <span class="summary-value">${totalOccurrences}</span>
                </div>
            </div>
        `;
    }

    renderGoogleExplanation() {
        if (!this.googleExplanation) return;
        this.googleExplanation.innerHTML = `
            <strong>Why multiple links?</strong> Google Calendar's does not support hourly spacing so we need to create many instances, one for each hour.
        `;
    }

    renderGoogleWarning(interval) {
        if (!this.googleWarning) return;
        if (!Number.isFinite(interval) || interval <= 0 || 24 % interval === 0) {
            this.googleWarning.hidden = true;
            this.googleWarning.textContent = '';
            return;
        }

        this.googleWarning.hidden = false;
        this.googleWarning.textContent = 'These quick links cover the first 24 hours. For irregular spacing, use the .ics download for full accuracy.';
    }

    renderGoogleLinks(firstDaySlots, slotOccurrences) {
        const title = this.eventTitleInput?.value || '💊 Take Medication';

        firstDaySlots.forEach(({ slotKey, event }) => {
            const occurrences = slotOccurrences.get(slotKey) || [event];
            const linkData = generateGoogleLinkData({ title, event, occurrences });

            const link = document.createElement('a');
            link.href = linkData.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'google-link';
            link.innerHTML = `
                <div class="google-link-info">
                    <span class="google-link-time">Daily at ${linkData.timeLabel}</span>
                    <span class="google-link-range">${linkData.rangeLabel}</span>
                    <span class="google-link-count">${linkData.doseLabel}</span>
                </div>
                <span class="google-link-action">Open →</span>
            `;

            this.googleLinksList.appendChild(link);
        });
    }

    exportToICS() {
        if (!this.ensureSchedule()) return;
        const title = this.eventTitleInput?.value || '💊 Take Medication';
        const content = buildCalendarICS(this.schedule, title);
        downloadTextFile(content, 'medication-schedule.ics');
        this.close();
    }
}
