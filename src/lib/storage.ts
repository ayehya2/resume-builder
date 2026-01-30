import type { ResumeData, CoverLetterData, DocumentType } from '../types';

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
        // Standard sections
        const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];

        // Custom sections from customSections array
        const customSectionIds = (data.customSections || []).map((cs: any) => cs.id);

        data.sections = Array.from(new Set(data.sections)).filter((s: any) =>
            standardSections.includes(s) || customSectionIds.includes(s)
        );
    }

    // Migrate CustomSections from version 1 (content: string[]) to version 2 (items: CustomSectionEntry[])
    if (data.customSections && Array.isArray(data.customSections)) {
        data.customSections = data.customSections.map((section: any) => {
            if (section.content) {
                // If it's the old format, migrate to new format
                const newItems = section.content.map((c: string) => ({
                    title: '',
                    subtitle: '',
                    date: '',
                    location: '',
                    link: '',
                    bullets: [c]
                }));
                const { content, ...rest } = section;
                return { ...rest, items: newItems.length > 0 ? newItems : [{ title: '', subtitle: '', date: '', location: '', link: '', bullets: [''] }] };
            }
            return section;
        });
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

// Active tab storage
const ACTIVE_TAB_KEY = 'resume-builder-active-tab';

export function saveActiveTab(tab: string): void {
    localStorage.setItem(ACTIVE_TAB_KEY, tab);
}

export function loadActiveTab(): string {
    return localStorage.getItem(ACTIVE_TAB_KEY) || 'basics';
}

// Cover Letter storage
const COVER_LETTER_KEY = 'resume-builder-cover-letter';

export function saveCoverLetterData(data: CoverLetterData): void {
    try {
        localStorage.setItem(COVER_LETTER_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save cover letter data:', error);
    }
}

export function loadCoverLetterData(): CoverLetterData | null {
    try {
        const saved = localStorage.getItem(COVER_LETTER_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
}

// Document type storage
const DOCUMENT_TYPE_KEY = 'resume-builder-document-type';

export function saveDocumentType(type: DocumentType): void {
    localStorage.setItem(DOCUMENT_TYPE_KEY, type);
}

export function loadDocumentType(): DocumentType {
    const type = localStorage.getItem(DOCUMENT_TYPE_KEY) as DocumentType;
    return type || 'resume';
}
