import { createElement, type ReactNode } from 'react';

/**
 * Parse **bold** and *italic* markdown syntax in text and return React elements.
 */
export function parseBoldText(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    // Matches **bold**, __bold__, *italic*, or _italic_
    const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        if (match[1] === '**' || match[1] === '__') {
            parts.push(<strong key={match.index}>{match[2]}</strong>);
        } else if (match[3] === '*' || match[3] === '_') {
            parts.push(<em key={match.index}>{match[4]}</em>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

/**
 * Parse **bold** and *italic* markdown syntax for @react-pdf/renderer.
 */
export function parseBoldTextPDF(
    text: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TextComponent: any
): ReactNode[] {
    const parts: ReactNode[] = [];
    // Matches **bold**, __bold__, *italic*, or _italic_
    const regex = /(\*\*|__)(.+?)\1|(\*|_)(.+?)\3/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const style: any = {};
        if (match[1] === '**' || match[1] === '__') {
            style.fontWeight = 'bold';
        } else if (match[3] === '*' || match[3] === '_') {
            style.fontStyle = 'italic';
        }

        parts.push(
            createElement(
                TextComponent,
                { key: `s-${match.index}`, style },
                match[2] || match[4]
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
 * Strip **bold** and *italic* markers from text (for plain text contexts).
 */
export function stripBoldMarkers(text: string): string {
    return text.replace(/(\*\*|\*)(.+?)\1/g, '$2');
}
