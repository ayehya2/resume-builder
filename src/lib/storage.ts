import type { ResumeData } from '../types';

const STORAGE_KEY = 'resume-builder-data';
const VERSION_KEY = 'resume-builder-version';
const CURRENT_VERSION = '2.0';

// Save resume data to localStorage
export function saveResumeData(data: ResumeData): void {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (error) {
        console.error('Failed to save resume data:', error);
    }
}

// Load resume data from localStorage
export function loadResumeData(): ResumeData | null {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) {
            return null;
        }

        const data = JSON.parse(serialized) as ResumeData;

        // Migrate old data if needed
        return migrateData(data);
    } catch (error) {
        console.error('Failed to load resume data:', error);
        return null;
    }
}

// Clear all saved data
export function clearResumeData(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERSION_KEY);
    } catch (error) {
        console.error('Failed to clear resume data:', error);
    }
}

// Export to JSON file
export function exportToJSON(data: ResumeData): string {
    return JSON.stringify(data, null, 2);
}

// Import from JSON string
export function importFromJSON(jsonString: string): ResumeData {
    try {
        const data = JSON.parse(jsonString) as ResumeData;
        return migrateData(data);
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
}

// Migrate old data format to new format
function migrateData(data: any): ResumeData {
    // Ensure unique sections
    if (data.sections && Array.isArray(data.sections)) {
        data.sections = Array.from(new Set(data.sections)).filter((s: any) =>
            ['profile', 'education', 'work', 'skills', 'projects', 'awards'].includes(s)
        );
    }

    return data as ResumeData;
}

// Dark mode storage
const DARK_MODE_KEY = 'resume-builder-dark-mode';

export function saveDarkMode(enabled: boolean): void {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(enabled));
}

export function loadDarkMode(): boolean {
    try {
        const saved = localStorage.getItem(DARK_MODE_KEY);
        return saved ? JSON.parse(saved) : false;
    } catch {
        return false;
    }
}
