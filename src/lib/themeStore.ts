import { create } from 'zustand';

// ── Color Theme (accent + sidebar colors) ──
// Separate from light/dark mode — each theme has both light and dark variants.

export interface ThemeColors {
    accent: string;
    accentHover: string;
    accentLight: string;
    sidebar: string;
    sidebarText: string;
    sidebarBorder: string;
    sidebarHover: string;
}

export interface ColorTheme {
    id: string;
    name: string;
    swatch: string; // preview color for the theme picker
    light: ThemeColors;
    dark: ThemeColors;
}

export const COLOR_THEMES: ColorTheme[] = [
    {
        id: 'blue', name: 'Blue', swatch: '#3b82f6',
        light: { accent: '#2563eb', accentHover: '#3b82f6', accentLight: '#dbeafe', sidebar: '#0f172a', sidebarText: '#f8fafc', sidebarBorder: '#1e293b', sidebarHover: '#1e293b' },
        dark: { accent: '#3b82f6', accentHover: '#60a5fa', accentLight: '#1e3a8a', sidebar: '#020617', sidebarText: '#e2e8f0', sidebarBorder: '#1e293b', sidebarHover: '#0f172a' },
    },
    {
        id: 'indigo', name: 'Indigo', swatch: '#6366f1',
        light: { accent: '#4f46e5', accentHover: '#6366f1', accentLight: '#e0e7ff', sidebar: '#1e1b4b', sidebarText: '#e0e7ff', sidebarBorder: '#312e81', sidebarHover: '#312e81' },
        dark: { accent: '#6366f1', accentHover: '#818cf8', accentLight: '#312e81', sidebar: '#0f0d2e', sidebarText: '#c7d2fe', sidebarBorder: '#1e1b4b', sidebarHover: '#1e1b4b' },
    },
    {
        id: 'violet', name: 'Violet', swatch: '#8b5cf6',
        light: { accent: '#7c3aed', accentHover: '#8b5cf6', accentLight: '#ede9fe', sidebar: '#4c1d95', sidebarText: '#ede9fe', sidebarBorder: '#5b21b6', sidebarHover: '#5b21b6' },
        dark: { accent: '#8b5cf6', accentHover: '#a78bfa', accentLight: '#4c1d95', sidebar: '#2e1065', sidebarText: '#ddd6fe', sidebarBorder: '#4c1d95', sidebarHover: '#3b0764' },
    },
    {
        id: 'purple', name: 'Purple', swatch: '#a855f7',
        light: { accent: '#9333ea', accentHover: '#a855f7', accentLight: '#f3e8ff', sidebar: '#3b0764', sidebarText: '#e9d5ff', sidebarBorder: '#581c87', sidebarHover: '#581c87' },
        dark: { accent: '#a855f7', accentHover: '#c084fc', accentLight: '#581c87', sidebar: '#1a0533', sidebarText: '#e9d5ff', sidebarBorder: '#3b0764', sidebarHover: '#3b0764' },
    },
    {
        id: 'fuchsia', name: 'Fuchsia', swatch: '#d946ef',
        light: { accent: '#c026d3', accentHover: '#d946ef', accentLight: '#fae8ff', sidebar: '#701a75', sidebarText: '#fae8ff', sidebarBorder: '#86198f', sidebarHover: '#86198f' },
        dark: { accent: '#d946ef', accentHover: '#e879f9', accentLight: '#701a75', sidebar: '#4a044e', sidebarText: '#f5d0fe', sidebarBorder: '#701a75', sidebarHover: '#701a75' },
    },
    {
        id: 'rose', name: 'Rose', swatch: '#f43f5e',
        light: { accent: '#e11d48', accentHover: '#f43f5e', accentLight: '#ffe4e6', sidebar: '#881337', sidebarText: '#ffe4e6', sidebarBorder: '#9f1239', sidebarHover: '#9f1239' },
        dark: { accent: '#f43f5e', accentHover: '#fb7185', accentLight: '#881337', sidebar: '#4c0519', sidebarText: '#fecdd3', sidebarBorder: '#881337', sidebarHover: '#881337' },
    },
    {
        id: 'red', name: 'Red', swatch: '#ef4444',
        light: { accent: '#dc2626', accentHover: '#ef4444', accentLight: '#fee2e2', sidebar: '#7f1d1d', sidebarText: '#fee2e2', sidebarBorder: '#991b1b', sidebarHover: '#991b1b' },
        dark: { accent: '#ef4444', accentHover: '#f87171', accentLight: '#7f1d1d', sidebar: '#450a0a', sidebarText: '#fecaca', sidebarBorder: '#7f1d1d', sidebarHover: '#7f1d1d' },
    },
    {
        id: 'orange', name: 'Orange', swatch: '#f97316',
        light: { accent: '#ea580c', accentHover: '#f97316', accentLight: '#ffedd5', sidebar: '#7c2d12', sidebarText: '#ffedd5', sidebarBorder: '#9a3412', sidebarHover: '#9a3412' },
        dark: { accent: '#f97316', accentHover: '#fb923c', accentLight: '#7c2d12', sidebar: '#431407', sidebarText: '#fed7aa', sidebarBorder: '#7c2d12', sidebarHover: '#7c2d12' },
    },
    {
        id: 'amber', name: 'Amber', swatch: '#f59e0b',
        light: { accent: '#d97706', accentHover: '#f59e0b', accentLight: '#fef3c7', sidebar: '#78350f', sidebarText: '#fef3c7', sidebarBorder: '#92400e', sidebarHover: '#92400e' },
        dark: { accent: '#f59e0b', accentHover: '#fbbf24', accentLight: '#78350f', sidebar: '#451a03', sidebarText: '#fde68a', sidebarBorder: '#78350f', sidebarHover: '#78350f' },
    },
    {
        id: 'yellow', name: 'Yellow', swatch: '#eab308',
        light: { accent: '#ca8a04', accentHover: '#eab308', accentLight: '#fef9c3', sidebar: '#713f12', sidebarText: '#fef9c3', sidebarBorder: '#854d0e', sidebarHover: '#854d0e' },
        dark: { accent: '#eab308', accentHover: '#facc15', accentLight: '#713f12', sidebar: '#422006', sidebarText: '#fef08a', sidebarBorder: '#713f12', sidebarHover: '#713f12' },
    },
    {
        id: 'lime', name: 'Lime', swatch: '#84cc16',
        light: { accent: '#65a30d', accentHover: '#84cc16', accentLight: '#ecfccb', sidebar: '#365314', sidebarText: '#ecfccb', sidebarBorder: '#3f6212', sidebarHover: '#3f6212' },
        dark: { accent: '#84cc16', accentHover: '#a3e635', accentLight: '#365314', sidebar: '#1a2e05', sidebarText: '#d9f99d', sidebarBorder: '#365314', sidebarHover: '#365314' },
    },
    {
        id: 'emerald', name: 'Emerald', swatch: '#10b981',
        light: { accent: '#059669', accentHover: '#10b981', accentLight: '#d1fae5', sidebar: '#064e3b', sidebarText: '#d1fae5', sidebarBorder: '#065f46', sidebarHover: '#065f46' },
        dark: { accent: '#10b981', accentHover: '#34d399', accentLight: '#064e3b', sidebar: '#022c22', sidebarText: '#a7f3d0', sidebarBorder: '#064e3b', sidebarHover: '#064e3b' },
    },
    {
        id: 'teal', name: 'Teal', swatch: '#14b8a6',
        light: { accent: '#0d9488', accentHover: '#14b8a6', accentLight: '#ccfbf1', sidebar: '#134e4a', sidebarText: '#ccfbf1', sidebarBorder: '#115e59', sidebarHover: '#115e59' },
        dark: { accent: '#14b8a6', accentHover: '#2dd4bf', accentLight: '#134e4a', sidebar: '#042f2e', sidebarText: '#99f6e4', sidebarBorder: '#134e4a', sidebarHover: '#134e4a' },
    },
    {
        id: 'cyan', name: 'Cyan', swatch: '#06b6d4',
        light: { accent: '#0891b2', accentHover: '#06b6d4', accentLight: '#cffafe', sidebar: '#164e63', sidebarText: '#cffafe', sidebarBorder: '#155e75', sidebarHover: '#155e75' },
        dark: { accent: '#06b6d4', accentHover: '#22d3ee', accentLight: '#164e63', sidebar: '#083344', sidebarText: '#a5f3fc', sidebarBorder: '#164e63', sidebarHover: '#164e63' },
    },
    {
        id: 'sky', name: 'Sky', swatch: '#0ea5e9',
        light: { accent: '#0284c7', accentHover: '#0ea5e9', accentLight: '#e0f2fe', sidebar: '#0c4a6e', sidebarText: '#e0f2fe', sidebarBorder: '#075985', sidebarHover: '#075985' },
        dark: { accent: '#0ea5e9', accentHover: '#38bdf8', accentLight: '#0c4a6e', sidebar: '#082f49', sidebarText: '#bae6fd', sidebarBorder: '#0c4a6e', sidebarHover: '#0c4a6e' },
    },
    {
        id: 'slate', name: 'Slate', swatch: '#64748b',
        light: { accent: '#475569', accentHover: '#64748b', accentLight: '#f1f5f9', sidebar: '#0f172a', sidebarText: '#e2e8f0', sidebarBorder: '#1e293b', sidebarHover: '#1e293b' },
        dark: { accent: '#64748b', accentHover: '#94a3b8', accentLight: '#1e293b', sidebar: '#020617', sidebarText: '#cbd5e1', sidebarBorder: '#1e293b', sidebarHover: '#0f172a' },
    },
    {
        id: 'zinc', name: 'Zinc', swatch: '#71717a',
        light: { accent: '#52525b', accentHover: '#71717a', accentLight: '#f4f4f5', sidebar: '#18181b', sidebarText: '#e4e4e7', sidebarBorder: '#27272a', sidebarHover: '#27272a' },
        dark: { accent: '#71717a', accentHover: '#a1a1aa', accentLight: '#27272a', sidebar: '#09090b', sidebarText: '#d4d4d8', sidebarBorder: '#27272a', sidebarHover: '#18181b' },
    },
    {
        id: 'stone', name: 'Stone', swatch: '#78716c',
        light: { accent: '#57534e', accentHover: '#78716c', accentLight: '#f5f5f4', sidebar: '#1c1917', sidebarText: '#e7e5e4', sidebarBorder: '#292524', sidebarHover: '#292524' },
        dark: { accent: '#78716c', accentHover: '#a8a29e', accentLight: '#292524', sidebar: '#0c0a09', sidebarText: '#d6d3d1', sidebarBorder: '#292524', sidebarHover: '#1c1917' },
    },
    {
        id: 'green', name: 'Green', swatch: '#22c55e',
        light: { accent: '#16a34a', accentHover: '#22c55e', accentLight: '#dcfce7', sidebar: '#14532d', sidebarText: '#dcfce7', sidebarBorder: '#166534', sidebarHover: '#166534' },
        dark: { accent: '#22c55e', accentHover: '#4ade80', accentLight: '#14532d', sidebar: '#052e16', sidebarText: '#bbf7d0', sidebarBorder: '#14532d', sidebarHover: '#14532d' },
    },
    {
        id: 'pink', name: 'Pink', swatch: '#ec4899',
        light: { accent: '#db2777', accentHover: '#ec4899', accentLight: '#fce7f3', sidebar: '#831843', sidebarText: '#fce7f3', sidebarBorder: '#9d174d', sidebarHover: '#9d174d' },
        dark: { accent: '#ec4899', accentHover: '#f472b6', accentLight: '#831843', sidebar: '#500724', sidebarText: '#fbcfe8', sidebarBorder: '#831843', sidebarHover: '#831843' },
    },
];

export const THEME_MAP = Object.fromEntries(COLOR_THEMES.map(t => [t.id, t])) as Record<string, ColorTheme>;

// ── Theme Store ──
// Manages color theme (accent) + dark mode toggle SEPARATELY

const STORAGE_KEY_THEME = 'app-color-theme';
const STORAGE_KEY_DARK = 'darkMode';

function loadThemeId(): string {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_THEME);
        if (saved && THEME_MAP[saved]) return saved;
    } catch { /* ignore */ }
    return 'blue';
}

function loadDarkMode(): boolean {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_DARK);
        if (saved !== null) return saved === 'true';
    } catch { /* ignore */ }
    return false;
}

interface ThemeState {
    colorThemeId: string;
    isDark: boolean;
    setColorTheme: (id: string) => void;
    setIsDark: (dark: boolean) => void;
    toggleDark: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    colorThemeId: loadThemeId(),
    isDark: loadDarkMode(),
    setColorTheme: (id) => {
        if (!THEME_MAP[id]) return;
        localStorage.setItem(STORAGE_KEY_THEME, id);
        set({ colorThemeId: id });
    },
    setIsDark: (dark) => {
        localStorage.setItem(STORAGE_KEY_DARK, String(dark));
        set({ isDark: dark });
    },
    toggleDark: () => {
        const newDark = !get().isDark;
        localStorage.setItem(STORAGE_KEY_DARK, String(newDark));
        set({ isDark: newDark });
    },
}));

/**
 * Apply theme CSS custom properties and dark/light class to the document.
 * Call this whenever colorThemeId or isDark changes.
 */
export function applyTheme(colorThemeId: string, isDark: boolean): void {
    const theme = THEME_MAP[colorThemeId] || THEME_MAP['blue'];
    const colors = isDark ? theme.dark : theme.light;
    const root = document.documentElement;
    const s = root.style;

    s.setProperty('--accent', colors.accent);
    s.setProperty('--accent-hover', colors.accentHover);
    s.setProperty('--accent-light', colors.accentLight);
    s.setProperty('--sidebar-bg', colors.sidebar);
    s.setProperty('--sidebar-text', colors.sidebarText);
    s.setProperty('--sidebar-border', colors.sidebarBorder);
    s.setProperty('--sidebar-hover', colors.sidebarHover);

    // Apply dark class
    if (isDark) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}
