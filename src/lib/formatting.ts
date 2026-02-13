import type { FontFamily, BulletStyle, ColorTheme, SectionDivider, Spacing, FormattingOptions } from '../types';
import type { CSSProperties } from 'react';

// Font family CSS mapping
export function getFontFamilyCSS(fontFamily: FontFamily): string {
    const fontMap: Record<FontFamily, string> = {
        default: '"Times New Roman", Times, serif',
        times: '"Times New Roman", Times, serif',
        arial: 'Arial, Helvetica, sans-serif',
        calibri: 'Calibri, sans-serif',
        georgia: 'Georgia, serif',
        helvetica: 'Helvetica, Arial, sans-serif',
        palatino: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
        garamond: 'Garamond, serif',
    };
    return fontMap[fontFamily] || fontMap.default;
}

// Bullet symbol mapping
export function getBulletSymbol(bulletStyle: BulletStyle): string {
    const bulletMap: Record<BulletStyle, string> = {
        bullet: '•',
        dash: '-',
        arrow: '→',
        circle: '○',
        square: '■',
        diamond: '◆',
        star: '★',
        chevron: '›',
    };
    return bulletMap[bulletStyle] || '•';
}

// Color theme values
export function getColorValue(theme: ColorTheme, customColor: string): string {
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
        custom: customColor,
    };
    return colorMap[theme] || '#000000';
}

// Section divider style
export function getSectionDividerStyle(divider: SectionDivider): CSSProperties {
    const baseStyle: CSSProperties = {
        borderBottom: 'none',
        paddingBottom: '2pt',
    };

    switch (divider) {
        case 'line':
            return { ...baseStyle, borderBottom: '1.5pt solid currentColor' };
        case 'double':
            return { ...baseStyle, borderBottom: '3pt double currentColor' };
        case 'thick':
            return { ...baseStyle, borderBottom: '2.5pt solid currentColor' };
        case 'dotted':
            return { ...baseStyle, borderBottom: '1.5pt dotted currentColor' };
        case 'none':
        default:
            return baseStyle;
    }
}

// Spacing to pixels/points
export function getSpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '6pt',
        normal: '12pt',
        relaxed: '18pt',
        spacious: '24pt',
    };
    return spacingMap[spacing] || '12pt';
}

// Bullet indentation to inches
export function getBulletIndentValue(indent: import('../types').BulletIndent): string {
    const indentMap = {
        none: '0',
        small: '0.2in',
        medium: '0.4in',
        large: '0.6in',
    };
    return indentMap[indent] || '0';
}

// Name size to pt
export function getNameSize(nameSize: import('../types').NameSize): string {
    const sizeMap = {
        huge: '28pt',
        large: '22pt',
        large2: '20pt',
        normal: '18pt',
    };
    return sizeMap[nameSize] || '22pt';
}

// Section title size to pt
export function getSectionTitleSize(size: import('../types').SectionTitleSize): string {
    const sizeMap = {
        large: '16pt',
        normal: '14pt',
        small: '12pt',
    };
    return sizeMap[size] || '14pt';
}

// Entry spacing to pt
export function getEntrySpacingValue(spacing: Spacing): string {
    const spacingMap: Record<Spacing, string> = {
        tight: '4pt',
        normal: '8pt',
        relaxed: '14pt',
        spacious: '20pt',
    };
    return spacingMap[spacing] || '8pt';
}

// Bullet gap to pt
export function getBulletGapValue(gap: string): string {
    return gap || '4pt';
}

// Section header case
export function getSectionHeaderCase(style: 'uppercase' | 'capitalize' | 'normal'): CSSProperties['textTransform'] {
    const styleMap: Record<string, CSSProperties['textTransform']> = {
        uppercase: 'uppercase',
        capitalize: 'capitalize',
        normal: 'none'
    };
    return styleMap[style] || 'uppercase';
}

// Apply formatting to template
export function applyFormattingStyles(formatting: FormattingOptions): CSSProperties {
    return {
        fontFamily: getFontFamilyCSS(formatting.fontFamily),
        textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
        fontSize: formatting.baseFontSize,
        lineHeight: formatting.lineSpacing,
        padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
        color: getColorValue(formatting.colorTheme, formatting.customColor),
    };
}

// Formatting presets
export const formattingPresets: Record<string, Partial<FormattingOptions>> = {
    classical: {
        fontFamily: 'times',
        baseFontSize: '11pt',
        nameSize: 'large',
        lineSpacing: '1.15',
        sectionSpacing: 'normal',
        bulletStyle: 'bullet',
        colorTheme: 'black',
        sectionDividers: 'line',
        headerAlignment: 'center',
    },
    modern: {
        fontFamily: 'calibri',
        baseFontSize: '11pt',
        nameSize: 'huge',
        lineSpacing: '1.2',
        sectionSpacing: 'relaxed',
        bulletStyle: 'square',
        colorTheme: 'darkblue',
        sectionDividers: 'thick',
        headerAlignment: 'left',
    },
    minimal: {
        fontFamily: 'arial',
        baseFontSize: '10pt',
        nameSize: 'large2',
        lineSpacing: '1.0',
        sectionSpacing: 'tight',
        bulletStyle: 'dash',
        colorTheme: 'black',
        sectionDividers: 'none',
        headerAlignment: 'left',
    },
    bold: {
        fontFamily: 'helvetica',
        baseFontSize: '12pt',
        nameSize: 'huge',
        lineSpacing: '1.3',
        sectionSpacing: 'spacious',
        bulletStyle: 'star',
        colorTheme: 'maroon',
        sectionDividers: 'double',
        headerAlignment: 'center',
    },
};

export const capitalizeWords = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};
