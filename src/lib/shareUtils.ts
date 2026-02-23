import pako from 'pako';
import type { ResumeData } from '../types';

/**
 * Compress & base64url-encode a ResumeData object for URL sharing.
 * Typical output is ~3-5 KB for an average resume (vs ~12 KB raw JSON).
 */
export function encodeResumeForUrl(resumeData: ResumeData): string {
    const json = JSON.stringify(resumeData);
    const compressed = pako.deflate(new TextEncoder().encode(json));
    // base64url: standard base64 with + → -, / → _, no padding
    let base64 = btoa(String.fromCharCode(...compressed));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

/**
 * Decode a base64url-encoded, pako-compressed resume string back to ResumeData.
 * Returns null if the data is corrupt or invalid.
 */
export function decodeResumeFromUrl(encoded: string): ResumeData | null {
    try {
        // Restore base64 from base64url
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding
        while (base64.length % 4 !== 0) base64 += '=';

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const decompressed = pako.inflate(bytes);
        const json = new TextDecoder().decode(decompressed);
        const data = JSON.parse(json) as ResumeData;

        // Basic validation: must have basics and sections
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
