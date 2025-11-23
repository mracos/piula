/**
 * iOS-style wheel picker component
 */
export class WheelPicker {
    constructor({ viewport, list, onSelect }) {
        this.viewport = viewport;
        this.list = list;
        this.onSelect = onSelect;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.itemHeight = 40;

        this.bindEvents();
    }

    bindEvents() {
        this.viewport?.addEventListener('scroll', () => this.handleScroll());
    }

    /**
     * Populate picker with options
     * @param {Array<{value: number, label: string}>} options
     * @param {number} selectedValue
     */
    populate(options, selectedValue) {
        if (!this.list) return;

        this.list.innerHTML = '';
        options.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'picker-item';
            item.dataset.value = option.value;
            item.dataset.index = index;
            item.textContent = option.label;
            item.addEventListener('click', () => this.selectByIndex(index));
            this.list.appendChild(item);
        });

        const selectedIndex = options.findIndex(opt => opt.value === selectedValue);
        if (selectedIndex >= 0) {
            requestAnimationFrame(() => {
                this.scrollToIndex(selectedIndex, false);
            });
        }
    }

    /**
     * Scroll to specific index
     * @param {number} index
     * @param {boolean} smooth
     */
    scrollToIndex(index, smooth = true) {
        const targetScroll = index * this.itemHeight;

        if (this.viewport) {
            this.isScrolling = true;
            if (smooth) {
                this.viewport.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
                setTimeout(() => {
                    this.isScrolling = false;
                    this.updateSelection();
                }, 300);
            } else {
                this.viewport.scrollTop = targetScroll;
                this.isScrolling = false;
                this.updateSelection();
            }
        }
    }

    handleScroll() {
        if (this.isScrolling) return;

        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.updateSelection();
            this.notifySelection();
        }, 100);
    }

    updateSelection() {
        if (!this.viewport || !this.list) return;

        const scrollTop = this.viewport.scrollTop;
        const selectedIndex = Math.round(scrollTop / this.itemHeight);

        this.list.querySelectorAll('.picker-item').forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }

    selectByIndex(index) {
        this.scrollToIndex(index);
        setTimeout(() => this.notifySelection(), 350);
    }

    notifySelection() {
        if (!this.viewport || !this.onSelect) return;

        const scrollTop = this.viewport.scrollTop;
        const selectedIndex = Math.round(scrollTop / this.itemHeight);
        const selectedItem = this.list?.querySelector(`[data-index="${selectedIndex}"]`);

        if (selectedItem) {
            const value = parseInt(selectedItem.dataset.value, 10);
            this.onSelect(value, selectedIndex);
        }
    }

    /**
     * Get current selected value
     * @returns {number|null}
     */
    getSelectedValue() {
        if (!this.viewport || !this.list) return null;

        const scrollTop = this.viewport.scrollTop;
        const selectedIndex = Math.round(scrollTop / this.itemHeight);
        const selectedItem = this.list.querySelector(`[data-index="${selectedIndex}"]`);

        return selectedItem ? parseInt(selectedItem.dataset.value, 10) : null;
    }
}
