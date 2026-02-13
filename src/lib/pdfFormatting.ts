import type { FormattingOptions, FontFamily, BulletStyle, ColorTheme, BodyTextWeight, Spacing, DateSeparator, SectionTitleSize, NameSize, BulletIndent, SectionDivider, SkillLayout, DateFormat, SubHeaderWeight } from '../types';
import { Font } from '@react-pdf/renderer';

/**
 * Register custom fonts for full Unicode support in PDF rendering.
 * Using .woff format (NOT .woff2 — react-pdf doesn't support woff2).
 * Fonts loaded from jsDelivr CDN (fontsource packages).
 */

// Noto Sans — for sans-serif families
Font.register({
    family: 'NotoSans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-400-normal.woff', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-700-normal.woff', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-400-italic.woff', fontWeight: 400, fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.6/files/noto-sans-latin-700-italic.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
});

// Noto Serif — for serif families
Font.register({
    family: 'NotoSerif',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-400-normal.woff', fontWeight: 400 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-700-normal.woff', fontWeight: 700 },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-400-italic.woff', fontWeight: 400, fontStyle: 'italic' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-serif@5.0.6/files/noto-serif-latin-700-italic.woff', fontWeight: 700, fontStyle: 'italic' },
    ],
});

// Disable word hyphenation globally so PDF text doesn't break mid-word
Font.registerHyphenationCallback((word) => [word]);

/**
 * PDF Font Family Mapping
 * Uses registered custom fonts with full Unicode support.
 */
export function getPDFFontFamily(fontFamily: FontFamily): string {
    const fontMap: Record<FontFamily, string> = {
        default: 'NotoSerif',
        times: 'NotoSerif',
        arial: 'NotoSans',
        calibri: 'NotoSans',
        georgia: 'NotoSerif',
        helvetica: 'NotoSans',
        palatino: 'NotoSerif',
        garamond: 'NotoSerif',
        cambria: 'NotoSerif',
        bookAntiqua: 'NotoSerif',
        centurySchoolbook: 'NotoSerif',
    };
    return fontMap[fontFamily] || 'NotoSerif';
}

/**
 * Get bullet symbol from formatting options.
 * Noto Sans/Serif fonts support these Unicode characters.
 */
export function getPDFBulletSymbol(bulletStyle: BulletStyle): string {
    const bulletMap: Record<BulletStyle, string> = {
        bullet: '\u2022',   // • (Standard bullet)
        dash: '-',          // - (Standard hyphen for better compatibility)
        arrow: '\u2192',    // →
        circle: 'o',        // o (Fallback to 'o' for circle if Unicode fails)
        square: '\u25A0',   // ■
        diamond: '\u25C6',  // ◆
        star: '*',          // * (Standard star)
        chevron: '>',       // > (Standard chevron)
    };
    return bulletMap[bulletStyle] || '\u2022';
}

/**
 * Get color value from theme  
 */
export function getPDFColorValue(theme: ColorTheme, customColor: string): string {
    const colorMap: Record<ColorTheme, string> = {
        black: '#000000',
        navy: '#001f3f',
        darkblue: '#0074D9',
        darkgreen: '#2ECC40',
        maroon: '#85144B',
        purple: '#B10DC9',
        teal: '#0D9488',
        slate: '#475569',
        burgundy: '#6B1D38',
        forest: '#166534',
        charcoal: '#333333',
        steelblue: '#4682B4',
        indigo: '#4B0082',
        coral: '#FF6347',
        olive: '#556B2F',
        custom: customColor,
    };
    return colorMap[theme] || '#000000';
}

/**
 * Get page padding from margin settings
 */
export function getPDFPagePadding(formatting: FormattingOptions): string {
    return `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`;
}

/**
 * Get font size from baseFontSize (convert 11pt -> 11)
 */
export function getPDFFontSize(baseFontSize: string): number {
    return parseInt(baseFontSize.replace('pt', '')) || 11;
}

/**
 * Get name size in points
 */
export function getPDFNameSize(nameSize: NameSize): number {
    const sizeMap = {
        huge: 28,
        large: 22,
        large2: 20,
        normal: 18,
    };
    return sizeMap[nameSize] || 22;
}

/**
 * Get section title size in points
 */
export function getPDFSectionTitleSize(size: SectionTitleSize): number {
    const sizeMap = {
        large: 16,
        normal: 14,
        small: 12,
    };
    return sizeMap[size] || 14;
}

/**
 * Get line height from spacing
 */
export function getPDFLineHeight(lineSpacing: string): number {
    return parseFloat(lineSpacing) || 1.2;
}

/**
 * Get margin bottom for sections in points
 */
export function getPDFSectionMargin(spacing: Spacing): number {
    const spacingMap = {
        tight: 4,
        normal: 8,
        relaxed: 14,
        spacious: 20,
    };
    return spacingMap[spacing] || 8;
}

/**
 * Get margin bottom for entries (work/edu) in points
 */
export function getPDFEntrySpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 2,
        normal: 6,
        relaxed: 10,
        spacious: 16,
    };
    return spacingMap[spacing] || 6;
}

/**
 * Get gap between bullet and text in points
 */
export function getPDFBulletGap(gap: string): number {
    return parseInt(gap.replace('pt', '')) || 4;
}

/**
 * Get bullet indent in points (convert from inches)
 */
export function getPDFBulletIndent(indent: BulletIndent): number {
    const indentMap = {
        none: 0,
        small: 14,  // ~0.2in at 72dpi
        medium: 29, // ~0.4in at 72dpi
        large: 43,  // ~0.6in at 72dpi
    };
    return indentMap[indent] || 0;
}

/**
 * Helper to check if section dividers are enabled
 */
export function hasPDFSectionDivider(divider: SectionDivider): boolean {
    return divider !== 'none';
}

/**
 * Get border style for section dividers
 */
export function getPDFSectionBorderStyle(divider: SectionDivider, color: string): { borderBottom?: string; paddingBottom?: number } {
    switch (divider) {
        case 'line':
            return { borderBottom: `1.5pt solid ${color}`, paddingBottom: 2 };
        case 'double':
            return { borderBottom: `3pt double ${color}`, paddingBottom: 2 };
        case 'thick':
            return { borderBottom: `2.5pt solid ${color}`, paddingBottom: 2 };
        case 'dotted':
            return { borderBottom: `1.5pt dotted ${color}`, paddingBottom: 2 };
        case 'dashed':
            return { borderBottom: `1.5pt dashed ${color}`, paddingBottom: 2 };
        case 'none':
        default:
            return { paddingBottom: 2 };
    }
}

/**
 * Get social icon size
 */
export function getPDFSocialIconSize(baseFontSize: number): number {
    return baseFontSize + 2;
}

/**
 * Get case transformation for section headers
 */
export function getPDFSectionHeaderStyle(style: 'uppercase' | 'capitalize' | 'normal'): any {
    const styleMap = {
        uppercase: 'uppercase',
        capitalize: 'capitalize',
        normal: 'none'
    };
    return styleMap[style] || 'uppercase';
}

/**
 * Get sub-header font family based on weight for PDF.
 * With registered custom fonts, bold is handled via fontWeight CSS property.
 */
export function getPDFSubHeaderFont(_weight: SubHeaderWeight, baseFont: string): string {
    // Custom registered fonts handle weight via fontWeight CSS property,
    // not by appending '-Bold' to the font name.
    return baseFont;
}

/**
 * Get skill separator for PDF rendering
 */
export function getPDFSkillSeparator(layout: SkillLayout): string {
    const separatorMap = {
        comma: ', ',
        pipe: ' | ',
        'inline-tags': ', ',
    };
    return separatorMap[layout] || ', ';
}
/**
 * Format date for PDF (best effort)
 */
export function getPDFDateFormat(dateStr: string, format: DateFormat): string {
    if (!dateStr || dateStr.toLowerCase() === 'present' || dateStr.toLowerCase() === 'currently') {
        return dateStr;
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date: Date | null = null;

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
        date = parsed;
    } else {
        if (/^\d{4}$/.test(dateStr)) {
            date = new Date(parseInt(dateStr), 0, 1);
        }
        const mmYyyy = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
        if (mmYyyy) {
            date = new Date(parseInt(mmYyyy[2]), parseInt(mmYyyy[1]) - 1, 1);
        }
    }

    if (!date) return dateStr;

    const mm = date.getMonth();
    const yyyy = date.getFullYear();

    switch (format) {
        case 'numeric':
            return `${(mm + 1).toString().padStart(2, '0')}/${yyyy}`;
        case 'short':
            return `${months[mm]} ${yyyy}`;
        case 'long':
            return `${fullMonths[mm]} ${yyyy}`;
        default:
            return dateStr;
    }
}

// Body text font-weight for PDF
export function getPDFBodyTextWeight(weight: BodyTextWeight): number {
    const weightMap = {
        light: 300,
        normal: 400,
        medium: 500,
    };
    return weightMap[weight] || 400;
}

// Paragraph spacing for PDF (points)
export function getPDFParagraphSpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 2,
        normal: 4,
        relaxed: 8,
        spacious: 14,
    };
    return spacingMap[spacing] || 4;
}

// Section title spacing for PDF (points, margin above title)
export function getPDFSectionTitleSpacing(spacing: Spacing): number {
    const spacingMap = {
        tight: 4,
        normal: 8,
        relaxed: 14,
        spacious: 20,
    };
    return spacingMap[spacing] || 8;
}

// Date separator character for PDF
export function getPDFDateSeparator(separator: DateSeparator): string {
    return ` ${separator} `;
}
