import pako from 'pako';
import type { ResumeData } from '../types';

/**
 * Key mapping for JSON compression (abbreviations to save space)
 */
const KEY_MAP: Record<string, string> = {
    // Top-level
    basics: 'ba',
    education: 'ed',
    work: 'wo',
    skills: 'sk',
    projects: 'pr',
    awards: 'aw',
    customSections: 'cs',
    sections: 'sec',
    selectedTemplate: 'st',
    formatting: 'fo',

    // Basics
    name: 'n',
    email: 'e',
    phone: 'p',
    address: 'a',
    summary: 's',
    websites: 'w',
    url: 'u',

    // Work / Education / Projects
    company: 'c',
    position: 'po',
    location: 'l',
    startDate: 'sd',
    endDate: 'ed',
    bullets: 'b',
    institution: 'i',
    degree: 'd',
    field: 'f',
    graduationDate: 'gd',
    gpa: 'g',
    description: 'de',
    name_proj: 'np', // mapping 'name' in projects to 'np' to avoid collision if needed, but keys are local to objects

    // Skills
    category: 'ca',
    items: 'it',

    // Projects
    keywords: 'k',
    urlName: 'un',

    // Awards
    title: 't',
    awarder: 'ar',
    date: 'da',

    // Custom Sections
    id: 'id',
    type: 'ty',

    // Formatting (Very many keys, only common ones)
    fontFamily: 'ff',
    baseFontSize: 'bfs',
    lineSpacing: 'ls',
    sectionSpacing: 'ss',
    paragraphSpacing: 'ps',
};

// Inverse map for decoding
const REVERSE_MAP: Record<string, string> = Object.entries(KEY_MAP).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

/**
 * Apply key mapping to an object recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyKeyMapping(obj: unknown, map: Record<string, string>): any {
    if (Array.isArray(obj)) {
        return obj.map(item => applyKeyMapping(item, map));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: Record<string, unknown> = {};
        Object.entries(obj).forEach(([k, v]) => {
            const newKey = map[k] || k;
            newObj[newKey] = applyKeyMapping(v, map);
        });
        return newObj;
    }
    return obj;
}

/**
 * Compact a ResumeData object by removing empty strings, empty arrays, and nulls.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function compactResumeData(data: unknown): any {
    if (Array.isArray(data)) {
        return data
            .map(v => compactResumeData(v))
            .filter(v => {
                if (v === null || v === undefined || v === '') return false;
                if (Array.isArray(v) && v.length === 0) return false;
                if (typeof v === 'object' && Object.keys(v).length === 0) return false;
                return true;
            });
    } else if (data !== null && typeof data === 'object') {
        const newObj: Record<string, unknown> = {};
        Object.entries(data).forEach(([k, v]) => {
            const compacted = compactResumeData(v);
            if (compacted !== null && compacted !== undefined && compacted !== '') {
                if (Array.isArray(compacted) && compacted.length === 0) return;
                if (typeof compacted === 'object' && Object.keys(compacted).length === 0) return;
                newObj[k] = compacted;
            }
        });
        return newObj;
    }
    return data;
}

/**
 * Compress & base64url-encode a ResumeData object for URL sharing.
 */
export function encodeResumeForUrl(resumeData: ResumeData): string {
    const { ...cleanData } = resumeData;
    const compacted = compactResumeData(cleanData);
    const mapped = applyKeyMapping(compacted, KEY_MAP);

    const json = JSON.stringify(mapped);
    const compressed = pako.deflate(new TextEncoder().encode(json));
    let base64 = btoa(String.fromCharCode(...compressed));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

/**
 * Decode a base64url-encoded resume string back to ResumeData.
 */
export function decodeResumeFromUrl(encoded: string): ResumeData | null {
    try {
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) base64 += '=';

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const decompressed = pako.inflate(bytes);
        const json = new TextDecoder().decode(decompressed);
        const rawData = JSON.parse(json);

        // Reverse key mapping
        const data = applyKeyMapping(rawData, REVERSE_MAP) as ResumeData;

        // Basic validation
        if (!data.basics || !data.sections || !Array.isArray(data.sections)) {
            return null;
        }

        return data;
    } catch (e) {
        console.warn('Failed to decode shared resume data:', e);
        return null;
    }
}

/**
 * Build the full shareable URL from the current resume state.
 */
export function buildShareUrl(resumeData: ResumeData): string {
    const encoded = encodeResumeForUrl(resumeData);
    const base = window.location.origin + window.location.pathname;
    return `${base}?data=${encoded}`;
}
