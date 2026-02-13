import type { ResumeData, Basics, WorkExperience, Education, Skill } from '../types';

// ─── PDF Parsing ─────────────────────────────────────────────────
interface PDFParseResult {
    text: string;
    links: string[];
}

export async function parsePDF(file: File): Promise<PDFParseResult> {
    const pdfjsLib = await import('pdfjs-dist');

    // Use the bundled worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: string[] = [];
    const allLinks: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);

        // Extract text with spatial awareness
        const content = await page.getTextContent();
        const items = content.items.filter((item: any) => 'str' in item && item.str.trim().length > 0);

        if (items.length === 0) continue;

        // Sort items by Y (descending = top-to-bottom) then X (ascending = left-to-right)
        const sorted = [...items].sort((a: any, b: any) => {
            const yDiff = b.transform[5] - a.transform[5];
            if (Math.abs(yDiff) > 3) return yDiff; // different lines
            return a.transform[4] - b.transform[4]; // same line, sort by x
        });

        // Group items into lines based on Y-coordinate proximity
        const lines: string[] = [];
        let currentLine: string[] = [];
        let lastY: number | null = null;

        for (const item of sorted as any[]) {
            const y = item.transform[5];
            if (lastY !== null && Math.abs(lastY - y) > 3) {
                // New line
                if (currentLine.length > 0) {
                    lines.push(currentLine.join(' ').trim());
                }
                currentLine = [];
            }
            currentLine.push(item.str);
            lastY = y;
        }
        if (currentLine.length > 0) {
            lines.push(currentLine.join(' ').trim());
        }

        pages.push(lines.join('\n'));

        // Extract links from page annotations
        try {
            const annotations = await page.getAnnotations();
            for (const annot of annotations) {
                if (annot.subtype === 'Link' && annot.url) {
                    allLinks.push(annot.url);
                }
            }
        } catch {
            // Some PDFs don't support annotation extraction
        }
    }

    const text = pages.join('\n\n');

    // Also find URLs in the text itself via regex
    const urlRegex = /https?:\/\/[^\s,;)>\]"']+/gi;
    const textUrls = text.match(urlRegex) || [];
    for (const u of textUrls) {
        if (!allLinks.includes(u)) {
            allLinks.push(u);
        }
    }

    return { text, links: allLinks };
}

// ─── DOCX Parsing ────────────────────────────────────────────────
export async function parseDocx(file: File): Promise<string> {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

// ─── LaTeX Parsing ───────────────────────────────────────────────
export function parseLatexResume(tex: string): Partial<ResumeData> {
    const basics: Partial<Basics> = { name: '', email: '', phone: '', address: '', websites: [] };
    const work: WorkExperience[] = [];
    const education: Education[] = [];
    const skills: Skill[] = [];

    // Extract name from common LaTeX resume commands
    const nameMatch = tex.match(/\\name\{([^}]+)\}/i) ||
        tex.match(/\\textbf\{\\Huge\s+([^}]+)\}/i) ||
        tex.match(/\\begin\{center\}[^}]*\\textbf\{\\huge\s+([^}]+)\}/i) ||
        tex.match(/\\centerline\{\\namesize\\bfseries\s+([^}]+)\}/i);
    if (nameMatch) basics.name = nameMatch[1].trim();

    // Extract email
    const emailMatch = tex.match(/\\href\{mailto:([^}]+)\}/i) ||
        tex.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) basics.email = emailMatch[1].trim();

    // Extract phone
    const phoneMatch = tex.match(/(?:phone|tel|mobile)[:\s]*([+\d\s().-]{7,})/i) ||
        tex.match(/(\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})/);
    if (phoneMatch) basics.phone = phoneMatch[1].trim();

    // Extract work experience sections
    const workSection = tex.match(/\\(?:section|subsection)\*?\{(?:Experience|Work|Employment|Professional)[^}]*\}([\s\S]*?)(?=\\(?:section|subsection)\*?\{|\\end\{document\})/i);
    if (workSection) {
        const entries = workSection[1].split(/\\(?:resumeSubheading|entry|textbf)\{/);
        for (const entry of entries) {
            if (entry.trim().length < 10) continue;
            const parts = entry.split(/\}\s*\{/);
            if (parts.length >= 2) {
                work.push({
                    company: parts[0]?.replace(/[{}\\]/g, '').trim() || '',
                    position: parts[1]?.replace(/[{}\\]/g, '').trim() || '',
                    location: parts[2]?.replace(/[{}\\]/g, '').trim() || '',
                    startDate: '',
                    endDate: '',
                    bullets: extractLatexBullets(entry),
                });
            }
        }
    }

    // Extract education
    const eduSection = tex.match(/\\(?:section|subsection)\*?\{Education[^}]*\}([\s\S]*?)(?=\\(?:section|subsection)\*?\{|\\end\{document\})/i);
    if (eduSection) {
        const entries = eduSection[1].split(/\\(?:resumeSubheading|entry|textbf)\{/);
        for (const entry of entries) {
            if (entry.trim().length < 10) continue;
            const parts = entry.split(/\}\s*\{/);
            education.push({
                institution: parts[0]?.replace(/[{}\\]/g, '').trim() || '',
                degree: parts[1]?.replace(/[{}\\]/g, '').trim() || '',
                field: '',
                location: parts[2]?.replace(/[{}\\]/g, '').trim() || '',
                graduationDate: '',
            });
        }
    }

    // Extract skills
    const skillSection = tex.match(/\\(?:section|subsection)\*?\{(?:Skills|Technical)[^}]*\}([\s\S]*?)(?=\\(?:section|subsection)\*?\{|\\end\{document\})/i);
    if (skillSection) {
        const lines = skillSection[1].split(/\\(?:item|resumeItem|textbf)\{?/);
        for (const line of lines) {
            const cleaned = line.replace(/[{}\\]/g, '').trim();
            if (cleaned.length < 3) continue;
            const colonSplit = cleaned.split(':');
            if (colonSplit.length >= 2) {
                skills.push({
                    category: colonSplit[0].trim(),
                    items: colonSplit[1].split(/[,;]/).map(s => s.trim()).filter(Boolean),
                });
            }
        }
    }

    return {
        basics: basics as Basics,
        work,
        education,
        skills,
    };
}

function extractLatexBullets(text: string): string[] {
    const bullets: string[] = [];
    const itemMatches = text.match(/\\item\s+([^\n\\]+)/g);
    if (itemMatches) {
        for (const match of itemMatches) {
            const cleaned = match.replace(/\\item\s+/, '').replace(/[{}\\]/g, '').trim();
            if (cleaned) bullets.push(cleaned);
        }
    }
    return bullets.length > 0 ? bullets : [''];
}

// ─── Plain Text Resume Parsing ───────────────────────────────────
export function parseResumeText(text: string, links?: string[]): Partial<ResumeData> {
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) {
        throw new Error('No text content could be extracted from the file. The file may be image-based or empty.');
    }

    const basics: Partial<Basics> = { name: '', email: '', phone: '', address: '', websites: [] };
    const work: WorkExperience[] = [];
    const education: Education[] = [];
    const skills: Skill[] = [];

    // Try to extract name (usually the first prominent line)
    if (lines.length > 0) {
        basics.name = lines[0];
    }

    // Extract email
    for (const line of lines) {
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
            basics.email = emailMatch[1];
            break;
        }
    }

    // Extract phone
    for (const line of lines) {
        const phoneMatch = line.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
        if (phoneMatch) {
            basics.phone = phoneMatch[1];
            break;
        }
    }

    // Extract websites from links
    if (links && links.length > 0) {
        const websiteList: { name: string; url: string }[] = [];
        for (const url of links) {
            const lower = url.toLowerCase();
            if (lower.includes('linkedin.com')) {
                websiteList.push({ name: 'LinkedIn', url });
            } else if (lower.includes('github.com')) {
                websiteList.push({ name: 'GitHub', url });
            } else if (lower.includes('mailto:')) {
                // skip, already extracted as email
            } else {
                // Generic website
                try {
                    const hostname = new URL(url).hostname.replace('www.', '');
                    websiteList.push({ name: hostname, url });
                } catch {
                    websiteList.push({ name: 'Website', url });
                }
            }
        }
        // Deduplicate by url
        const seen = new Set<string>();
        basics.websites = websiteList.filter(w => {
            if (seen.has(w.url)) return false;
            seen.add(w.url);
            return true;
        });
    }

    // Also extract URLs from the text itself
    if (!links || links.length === 0) {
        const urlRegex = /https?:\/\/[^\s,;)>\]"']+/gi;
        const textUrls = text.match(urlRegex) || [];
        const websiteList: { name: string; url: string }[] = [];
        for (const url of textUrls) {
            const lower = url.toLowerCase();
            if (lower.includes('linkedin.com')) {
                websiteList.push({ name: 'LinkedIn', url });
            } else if (lower.includes('github.com')) {
                websiteList.push({ name: 'GitHub', url });
            } else {
                try {
                    const hostname = new URL(url).hostname.replace('www.', '');
                    websiteList.push({ name: hostname, url });
                } catch {
                    websiteList.push({ name: 'Website', url });
                }
            }
        }
        const seen = new Set<string>();
        basics.websites = websiteList.filter(w => {
            if (seen.has(w.url)) return false;
            seen.add(w.url);
            return true;
        });
    }

    // Section-based parsing
    type Section = { name: string; lines: string[] };
    const sections: Section[] = [];
    let currentSection: Section | null = null;

    const sectionHeaders = /^(experience|work\s*experience|employment|professional\s*experience|education|skills|technical\s*skills|projects|awards|certifications|summary|objective|profile)/i;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (sectionHeaders.test(line)) {
            currentSection = { name: line.toLowerCase().trim(), lines: [] };
            sections.push(currentSection);
        } else if (currentSection) {
            currentSection.lines.push(line);
        }
    }

    for (const section of sections) {
        if (/experience|employment|work/i.test(section.name)) {
            // Group lines into work entries
            let currentWork: WorkExperience | null = null;
            for (const line of section.lines) {
                // Heuristic: detect date ranges like "Jan 2020 - Present" or "2018 – 2020"
                const dateMatch = line.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4})\s*[-–—]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\.?\s+\d{4}|Present|Current)/i)
                    || line.match(/(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/i);

                if (dateMatch && currentWork) {
                    currentWork.startDate = dateMatch[1];
                    currentWork.endDate = dateMatch[2];
                    continue;
                }

                // Heuristic: if line looks like a title/company (no bullet), start new entry
                if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('–') && line.length > 5 && !currentWork) {
                    currentWork = {
                        company: line,
                        position: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        bullets: [],
                    };
                    work.push(currentWork);
                } else if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('–') && currentWork && !currentWork.position) {
                    currentWork.position = line;
                } else if ((line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('–')) && currentWork) {
                    currentWork.bullets.push(line.replace(/^[•\-*–]\s*/, ''));
                } else if (line.length > 20) {
                    // Might be a new entry
                    currentWork = {
                        company: line,
                        position: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        bullets: [],
                    };
                    work.push(currentWork);
                }
            }
            // Ensure at least one bullet per entry
            for (const w of work) {
                if (w.bullets.length === 0) w.bullets = [''];
            }
        } else if (/education/i.test(section.name)) {
            let currentEdu: Education | null = null;
            for (const line of section.lines) {
                if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length > 3) {
                    if (!currentEdu) {
                        currentEdu = { institution: line, degree: '', field: '', location: '', graduationDate: '' };
                        education.push(currentEdu);
                    } else if (!currentEdu.degree) {
                        currentEdu.degree = line;
                    } else {
                        // Start a new education entry
                        currentEdu = { institution: line, degree: '', field: '', location: '', graduationDate: '' };
                        education.push(currentEdu);
                    }
                }
            }
        } else if (/skills|technical/i.test(section.name)) {
            for (const line of section.lines) {
                const colonSplit = line.split(':');
                if (colonSplit.length >= 2) {
                    skills.push({
                        category: colonSplit[0].replace(/^[•\-*]\s*/, '').trim(),
                        items: colonSplit[1].split(/[,;]/).map(s => s.trim()).filter(Boolean),
                    });
                } else {
                    const items = line.replace(/^[•\-*]\s*/, '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
                    if (items.length > 0) {
                        skills.push({ category: 'General', items });
                    }
                }
            }
        }
    }

    return {
        basics: basics as Basics,
        work,
        education,
        skills,
    };
}

// ─── Unified Import Handler ─────────────────────────────────────
export async function parseResumeFile(file: File): Promise<Partial<ResumeData>> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    try {
        switch (ext) {
            case 'pdf': {
                const { text, links } = await parsePDF(file);
                if (!text || text.trim().length === 0) {
                    throw new Error('No text could be extracted from this PDF. It may be image-based (scanned). Try converting to a text-based PDF first.');
                }
                return parseResumeText(text, links);
            }
            case 'docx':
            case 'doc': {
                const text = await parseDocx(file);
                if (!text || text.trim().length === 0) {
                    throw new Error('No text could be extracted from this document.');
                }
                return parseResumeText(text);
            }
            case 'tex':
            case 'latex': {
                const text = await file.text();
                return parseLatexResume(text);
            }
            case 'txt': {
                const text = await file.text();
                return parseResumeText(text);
            }
            case 'json': {
                // JSON is handled separately in the caller for full-fidelity import
                throw new Error('JSON_PASSTHROUGH');
            }
            default:
                throw new Error(`Unsupported file type: .${ext}`);
        }
    } catch (error: any) {
        // Re-throw with more descriptive messages
        if (error?.message === 'JSON_PASSTHROUGH') throw error;
        if (error?.message?.includes('No text')) throw error;

        console.error(`Resume parser error for .${ext}:`, error);
        throw new Error(
            `Failed to parse .${ext} file: ${error?.message || 'Unknown error'}. ` +
            'Try saving the file in a different format (e.g., plain text or JSON).'
        );
    }
}

