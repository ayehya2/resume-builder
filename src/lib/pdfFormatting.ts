import type { FormattingOptions, FontFamily, BulletStyle, ColorTheme } from '../types';

/**
 * PDF Font Family Mapping
 * @react-pdf/renderer only supports built-in fonts: Helvetica, Times-Roman, Courier
 */
export function getPDFFontFamily(fontFamily: FontFamily): string {
    const fontMap: Record<FontFamily, string> = {
        default: 'Times-Roman',
        times: 'Times-Roman',
        arial: 'Helvetica',
        calibri: 'Helvetica',
        georgia: 'Times-Roman',
        helvetica: 'Helvetica',
        palatino: 'Times-Roman',
        garamond: 'Times-Roman',
    };
    return fontMap[fontFamily] || 'Times-Roman';
}

/**
 * Get bullet symbol from formatting options
 */
export function getPDFBulletSymbol(bulletStyle: BulletStyle): string {
    const bulletMap: Record<BulletStyle, string> = {
        bullet: '•',
        dash: '−',
        arrow: '→',
        circle: '○',
        square: '■',
        diamond: '◆',
        star: '★',
        chevron: '›',
    };
    return bulletMap[bulletStyle] || '•';
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
export function getPDFNameSize(nameSize: import('../types').NameSize): number {
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
export function getPDFSectionTitleSize(size: import('../types').SectionTitleSize): number {
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
export function getPDFSectionMargin(spacing: import('../types').Spacing): number {
    const spacingMap = {
        tight: 6,
        normal: 12,
        relaxed: 18,
        spacious: 24,
    };
    return spacingMap[spacing] || 12;
}

/**
 * Get margin bottom for entries (work/edu) in points
 */
export function getPDFEntrySpacing(spacing: import('../types').Spacing): number {
    const spacingMap = {
        tight: 4,
        normal: 8,
        relaxed: 14,
        spacious: 20,
    };
    return spacingMap[spacing] || 8;
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
export function getPDFBulletIndent(indent: import('../types').BulletIndent): number {
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
export function hasPDFSectionDivider(divider: import('../types').SectionDivider): boolean {
    return divider !== 'none';
}

/**
 * Get border style for section dividers
 */
export function getPDFSectionBorderStyle(divider: import('../types').SectionDivider, color: string): { borderBottom?: string; paddingBottom?: number } {
    switch (divider) {
        case 'line':
            return { borderBottom: `1.5pt solid ${color}`, paddingBottom: 2 };
        case 'double':
            return { borderBottom: `3pt double ${color}`, paddingBottom: 2 };
        case 'thick':
            return { borderBottom: `2.5pt solid ${color}`, paddingBottom: 2 };
        case 'dotted':
            return { borderBottom: `1.5pt dotted ${color}`, paddingBottom: 2 };
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
