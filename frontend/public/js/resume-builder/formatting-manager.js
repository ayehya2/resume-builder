/**
 * Formatting Manager for Resume Builder
 * Handles margins, fonts, spacing, and presets
 */

const FormattingManager = {
    init: function () {
        this.initializeControls();
        this.updateRangeValues();
    },

    initializeControls: function () {
        // Margin controls
        const pageMargins = document.getElementById('pageMargins');
        if (pageMargins) {
            this.setMarginValuesForPreset(pageMargins.value);
            pageMargins.addEventListener('change', (e) => {
                this.setMarginValuesForPreset(e.target.value);
                this.triggerPreviewUpdate();
            });
        }

        // Color theme
        const colorTheme = document.getElementById('colorTheme');
        const customColorGroup = document.getElementById('customColorGroup');
        if (colorTheme && customColorGroup) {
            colorTheme.addEventListener('change', (e) => {
                customColorGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
                this.triggerPreviewUpdate();
            });
        }

        // Generic listeners for all formatting inputs
        const formattingInputs = document.querySelectorAll('#formatting-section input, #formatting-section select');
        formattingInputs.forEach(input => {
            const eventType = input.type === 'range' ? 'input' : 'change';
            input.addEventListener(eventType, this.debounce(() => this.triggerPreviewUpdate(), 300));
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
                setTimeout(() => this.triggerPreviewUpdate(), 100);
            });
        });

        // Action buttons
        document.getElementById('resetFormattingBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('saveFormattingBtn')?.addEventListener('click', () => this.save());
    },

    setMarginValuesForPreset: function (preset) {
        const values = { 'narrow': 0, 'normal': 0.2, 'wide': 0.5 };
        const val = values[preset] ?? 0.2;
        ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    },

    updateRangeValues: function () {
        ['bulletIndent', 'listMarginVertical', 'listMarginLeft'].forEach(id => {
            const range = document.getElementById(id);
            const span = document.getElementById(id + 'Value');
            if (range && span) {
                const update = () => {
                    const unit = id.includes('margin') ? 'mm' : 'mm'; // Simplified
                    span.textContent = range.value + unit;
                };
                update();
                range.addEventListener('input', update);
            }
        });
    },

    applyPreset: function (preset) {
        const presets = {
            classic: { fontFamily: 'times', baseFontSize: '11pt', lineSpacing: '1.0', sectionSpacing: 'normal', bulletStyle: 'bullet', colorTheme: 'black', pageMargins: 'normal' },
            modern: { fontFamily: 'calibri', baseFontSize: '11pt', lineSpacing: '1.15', sectionSpacing: 'relaxed', bulletStyle: 'dash', colorTheme: 'darkblue', pageMargins: 'normal' },
            compact: { fontFamily: 'arial', baseFontSize: '10pt', lineSpacing: '0.9', sectionSpacing: 'compact', bulletStyle: 'bullet', colorTheme: 'black', pageMargins: 'narrow' },
            creative: { fontFamily: 'palatino', baseFontSize: '12pt', lineSpacing: '1.2', sectionSpacing: 'spacious', bulletStyle: 'arrow', colorTheme: 'purple', pageMargins: 'wide' }
        };

        const settings = presets[preset];
        if (settings) {
            Object.entries(settings).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) el.value = val;
            });
            if (settings.pageMargins) this.setMarginValuesForPreset(settings.pageMargins);
            if (window.showNotification) window.showNotification(`Applied ${preset} preset!`, 'success');
        }
    },

    save: function () {
        const settings = {};
        document.querySelectorAll('#formatting-section input, #formatting-section select').forEach(input => {
            settings[input.id || input.name] = input.type === 'checkbox' ? input.checked : input.value;
        });
        localStorage.setItem('resumeFormatting', JSON.stringify(settings));
        if (window.showNotification) window.showNotification('Formatting saved!', 'success');
    },

    reset: function () {
        if (confirm('Reset formatting to defaults?')) {
            this.applyPreset('classic');
        }
    },

    triggerPreviewUpdate: function () {
        if (window.PreviewManager && typeof window.PreviewManager.debouncedUpdatePreview === 'function') {
            window.PreviewManager.debouncedUpdatePreview();
        } else if (typeof window.debouncedUpdatePreview === 'function') {
            window.debouncedUpdatePreview();
        }
    },

    debounce: function (func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
};

window.FormattingManager = FormattingManager;
