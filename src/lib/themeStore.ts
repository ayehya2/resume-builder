import { create } from 'zustand';

// ── Theme Definition ──

export interface AppTheme {
    id: string;
    name: string;
    isDark: boolean;
    colors: {
        /** Accent color for buttons, highlights, active states */
        accent: string;
        accentHover: string;
        accentLight: string; // light tint for backgrounds
        /** Sidebar */
        sidebar: string;
        sidebarText: string;
        sidebarBorder: string;
        sidebarHover: string;
        /** Swatch preview color */
        swatch: string;
    };
}

// ── 20 Themes ──

export const THEMES: AppTheme[] = [
    // ── LIGHT THEMES ──
    {
        id: 'light', name: 'Light', isDark: false,
        colors: { accent: '#2563eb', accentHover: '#3b82f6', accentLight: '#dbeafe', sidebar: '#0f172a', sidebarText: '#f8fafc', sidebarBorder: '#1e293b', sidebarHover: '#1e293b', swatch: '#f8fafc' },
    },
    {
        id: 'arctic', name: 'Arctic', isDark: false,
        colors: { accent: '#0284c7', accentHover: '#0ea5e9', accentLight: '#e0f2fe', sidebar: '#0c4a6e', sidebarText: '#e0f2fe', sidebarBorder: '#075985', sidebarHover: '#075985', swatch: '#e0f2fe' },
    },
    {
        id: 'mint', name: 'Mint', isDark: false,
        colors: { accent: '#0d9488', accentHover: '#14b8a6', accentLight: '#ccfbf1', sidebar: '#134e4a', sidebarText: '#ccfbf1', sidebarBorder: '#115e59', sidebarHover: '#115e59', swatch: '#ccfbf1' },
    },
    {
        id: 'lavender', name: 'Lavender', isDark: false,
        colors: { accent: '#7c3aed', accentHover: '#8b5cf6', accentLight: '#ede9fe', sidebar: '#4c1d95', sidebarText: '#ede9fe', sidebarBorder: '#5b21b6', sidebarHover: '#5b21b6', swatch: '#ede9fe' },
    },
    {
        id: 'rose-garden', name: 'Rose Garden', isDark: false,
        colors: { accent: '#e11d48', accentHover: '#f43f5e', accentLight: '#ffe4e6', sidebar: '#881337', sidebarText: '#ffe4e6', sidebarBorder: '#9f1239', sidebarHover: '#9f1239', swatch: '#ffe4e6' },
    },
    {
        id: 'warm-sand', name: 'Warm Sand', isDark: false,
        colors: { accent: '#d97706', accentHover: '#f59e0b', accentLight: '#fef3c7', sidebar: '#78350f', sidebarText: '#fef3c7', sidebarBorder: '#92400e', sidebarHover: '#92400e', swatch: '#fef3c7' },
    },
    {
        id: 'spring', name: 'Spring', isDark: false,
        colors: { accent: '#16a34a', accentHover: '#22c55e', accentLight: '#dcfce7', sidebar: '#14532d', sidebarText: '#dcfce7', sidebarBorder: '#166534', sidebarHover: '#166534', swatch: '#dcfce7' },
    },
    {
        id: 'coral', name: 'Coral', isDark: false,
        colors: { accent: '#ea580c', accentHover: '#f97316', accentLight: '#ffedd5', sidebar: '#7c2d12', sidebarText: '#ffedd5', sidebarBorder: '#9a3412', sidebarHover: '#9a3412', swatch: '#ffedd5' },
    },
    {
        id: 'steel', name: 'Steel', isDark: false,
        colors: { accent: '#475569', accentHover: '#64748b', accentLight: '#f1f5f9', sidebar: '#0f172a', sidebarText: '#e2e8f0', sidebarBorder: '#1e293b', sidebarHover: '#1e293b', swatch: '#e2e8f0' },
    },
    {
        id: 'indigo-light', name: 'Indigo', isDark: false,
        colors: { accent: '#4f46e5', accentHover: '#6366f1', accentLight: '#e0e7ff', sidebar: '#312e81', sidebarText: '#e0e7ff', sidebarBorder: '#3730a3', sidebarHover: '#3730a3', swatch: '#e0e7ff' },
    },

    // ── DARK THEMES ──
    {
        id: 'dark', name: 'Dark', isDark: true,
        colors: { accent: '#3b82f6', accentHover: '#60a5fa', accentLight: '#1e3a8a', sidebar: '#020617', sidebarText: '#e2e8f0', sidebarBorder: '#1e293b', sidebarHover: '#0f172a', swatch: '#0f172a' },
    },
    {
        id: 'ocean', name: 'Ocean', isDark: true,
        colors: { accent: '#0ea5e9', accentHover: '#38bdf8', accentLight: '#0c4a6e', sidebar: '#082f49', sidebarText: '#bae6fd', sidebarBorder: '#0c4a6e', sidebarHover: '#0c4a6e', swatch: '#082f49' },
    },
    {
        id: 'forest', name: 'Forest', isDark: true,
        colors: { accent: '#10b981', accentHover: '#34d399', accentLight: '#064e3b', sidebar: '#022c22', sidebarText: '#a7f3d0', sidebarBorder: '#064e3b', sidebarHover: '#064e3b', swatch: '#022c22' },
    },
    {
        id: 'midnight', name: 'Midnight', isDark: true,
        colors: { accent: '#8b5cf6', accentHover: '#a78bfa', accentLight: '#4c1d95', sidebar: '#1e1b4b', sidebarText: '#ddd6fe', sidebarBorder: '#312e81', sidebarHover: '#312e81', swatch: '#1e1b4b' },
    },
    {
        id: 'sunset', name: 'Sunset', isDark: true,
        colors: { accent: '#f97316', accentHover: '#fb923c', accentLight: '#7c2d12', sidebar: '#431407', sidebarText: '#fed7aa', sidebarBorder: '#7c2d12', sidebarHover: '#7c2d12', swatch: '#431407' },
    },
    {
        id: 'ruby', name: 'Ruby', isDark: true,
        colors: { accent: '#ef4444', accentHover: '#f87171', accentLight: '#7f1d1d', sidebar: '#450a0a', sidebarText: '#fecaca', sidebarBorder: '#7f1d1d', sidebarHover: '#7f1d1d', swatch: '#450a0a' },
    },
    {
        id: 'grape', name: 'Grape', isDark: true,
        colors: { accent: '#a855f7', accentHover: '#c084fc', accentLight: '#581c87', sidebar: '#3b0764', sidebarText: '#e9d5ff', sidebarBorder: '#581c87', sidebarHover: '#581c87', swatch: '#3b0764' },
    },
    {
        id: 'emerald-night', name: 'Emerald Night', isDark: true,
        colors: { accent: '#059669', accentHover: '#10b981', accentLight: '#064e3b', sidebar: '#052e16', sidebarText: '#a7f3d0', sidebarBorder: '#064e3b', sidebarHover: '#064e3b', swatch: '#052e16' },
    },
    {
        id: 'carbon', name: 'Carbon', isDark: true,
        colors: { accent: '#71717a', accentHover: '#a1a1aa', accentLight: '#27272a', sidebar: '#09090b', sidebarText: '#d4d4d8', sidebarBorder: '#27272a', sidebarHover: '#18181b', swatch: '#09090b' },
    },
    {
        id: 'autumn', name: 'Autumn', isDark: true,
        colors: { accent: '#d97706', accentHover: '#f59e0b', accentLight: '#78350f', sidebar: '#451a03', sidebarText: '#fde68a', sidebarBorder: '#78350f', sidebarHover: '#78350f', swatch: '#451a03' },
    },
];

export const THEME_MAP = Object.fromEntries(THEMES.map(t => [t.id, t])) as Record<string, AppTheme>;

// ── Theme Store ──

const STORAGE_KEY = 'app-theme';

function loadThemeId(): string {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && THEME_MAP[saved]) return saved;
    } catch { /* ignore */ }
    return 'light';
}

interface ThemeState {
    themeId: string;
    setTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    themeId: loadThemeId(),
    setTheme: (id) => {
        if (!THEME_MAP[id]) return;
        localStorage.setItem(STORAGE_KEY, id);
        set({ themeId: id });
    },
}));

/**
 * Apply theme CSS custom properties and dark/light class to the document.
 */
export function applyTheme(themeId: string): { isDark: boolean } {
    const theme = THEME_MAP[themeId] || THEME_MAP['light'];
    const root = document.documentElement;
    const s = root.style;

    // Accent colors
    s.setProperty('--accent', theme.colors.accent);
    s.setProperty('--accent-hover', theme.colors.accentHover);
    s.setProperty('--accent-light', theme.colors.accentLight);

    // Sidebar
    s.setProperty('--sidebar-bg', theme.colors.sidebar);
    s.setProperty('--sidebar-text', theme.colors.sidebarText);
    s.setProperty('--sidebar-border', theme.colors.sidebarBorder);
    s.setProperty('--sidebar-hover', theme.colors.sidebarHover);

    return { isDark: theme.isDark };
}
