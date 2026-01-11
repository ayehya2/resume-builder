// Theme management for TalentScope
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'default';
        this.init();
    }

    init() {
        // Don't re-apply theme if it was already applied early (to prevent flash)
        // But ensure UI state is correct
        this.currentTheme = this.getStoredTheme() || 'default';
        this.bindThemeToggle();
        this.updateToggleStates();
        
        // Only apply theme if body doesn't already have correct theme state
        const hasCorrectTheme = this.currentTheme === 'dark' 
            ? document.body.classList.contains('theme-dark')
            : !document.body.classList.contains('theme-dark');
            
        if (!hasCorrectTheme) {
            this.applyTheme(this.currentTheme);
        }
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        // Remove all possible theme classes to prevent conflicts
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-default');
        
        // For dark theme, add the class. For default theme, don't add any class
        // This matches the CSS pattern: .theme-dark vs body:not(.theme-dark)
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            document.body.style.background = '#0D1117';
        } else {
            // Default theme - remove background override and don't add theme class
            document.body.style.removeProperty('background');
        }
        
        // Ensure the correct radio button is checked for CSS :has() selector
        const allRadios = document.querySelectorAll('input[name="theme"], input[name="theme-mobile"]');
        allRadios.forEach(radio => {
            radio.checked = radio.value === theme;
        });
        
        this.currentTheme = theme;
        this.setStoredTheme(theme);
    }

    bindThemeToggle() {
        // Handle new custom toggle radio buttons
        const themeToggle = document.getElementById('themeToggle');
        const themeToggleMobile = document.getElementById('themeToggleMobile');

        if (themeToggle) {
            const radios = themeToggle.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.applyTheme(e.target.value);
                        // Sync mobile toggle
                        this.syncToggles(e.target.value, themeToggleMobile);
                    }
                });
            });
        }

        if (themeToggleMobile) {
            const radios = themeToggleMobile.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.applyTheme(e.target.value);
                        // Sync desktop toggle
                        this.syncToggles(e.target.value, themeToggle);
                    }
                });
            });
        }

        // Set initial state based on stored theme
        this.updateToggleStates();
    }

    syncToggles(theme, targetToggle) {
        if (targetToggle) {
            const targetRadio = targetToggle.querySelector(`input[value="${theme}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
            }
        }
    }

    updateToggleStates() {
        const themeToggle = document.getElementById('themeToggle');
        const themeToggleMobile = document.getElementById('themeToggleMobile');
        
        [themeToggle, themeToggleMobile].forEach(toggle => {
            if (toggle) {
                const radio = toggle.querySelector(`input[value="${this.currentTheme}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }
        });
    }

    cycleTheme() {
        const themes = ['default', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.applyTheme(themes[nextIndex]);
        this.updateToggleStates();
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
