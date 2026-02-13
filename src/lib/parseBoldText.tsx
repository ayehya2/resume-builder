import { createElement, type ReactNode } from 'react';

/**
 * Parse **bold** markdown syntax in text and return React elements.
 * Handles nested bold markers within a string, e.g. "Created **5,000+** monthly reports"
 * becomes: ["Created ", <strong>5,000+</strong>, " monthly reports"]
 */
export function parseBoldText(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the bold marker
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // Add the bold content
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

/**
 * Parse **bold** markdown syntax for @react-pdf/renderer.
 * Returns an array of React elements using createElement to avoid JSX import issues.
 * Bold segments get fontFamily: 'Helvetica-Bold'.
 *
 * Usage in PDF templates:
 *   <Text>{parseBoldTextPDF(bullet, TextComponent)}</Text>
 *
 * @param text - The text to parse
 * @param TextComponent - The Text component from @react-pdf/renderer
 */
export function parseBoldTextPDF(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TextComponent: any
): ReactNode[] {
    const parts: ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(
            createElement(
                TextComponent,
                { key: `b-${match.index}`, style: { fontFamily: 'Helvetica-Bold' } },
                match[1]
            )
        );
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

/**
 * Strip **bold** markers from text (for plain text contexts).
 */
export function stripBoldMarkers(text: string): string {
    return text.replace(/\*\*(.+?)\*\*/g, '$1');
}
