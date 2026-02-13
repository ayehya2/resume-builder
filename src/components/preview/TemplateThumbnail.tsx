import { TemplateRenderer } from '../../templates/html/TemplateRenderer';
import { useResumeStore } from '../../store';
import type { TemplateId } from '../../types';
import { useRef, useEffect, useState } from 'react';

interface TemplateThumbnailProps {
    templateId: TemplateId;
}

/**
 * TemplateThumbnail renders a scaled-down preview of a resume template.
 * Uses ResizeObserver to dynamically scale content to always fit within the container.
 */
export function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
    const { resumeData } = useResumeStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.25);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateScale = () => {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            if (containerWidth === 0 || containerHeight === 0) return;

            // Page dimensions in px (8.5in × 11in at 96dpi)
            const pageWidth = 816;
            const pageHeight = 1056;

            // Scale to fit both width and height, with a small padding
            const scaleX = (containerWidth - 4) / pageWidth;
            const scaleY = (containerHeight - 4) / pageHeight;
            setScale(Math.min(scaleX, scaleY));
        };

        const observer = new ResizeObserver(updateScale);
        observer.observe(container);
        updateScale();

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden bg-white pdf-paper select-none pointer-events-none"
        >
            <div
                key={`${templateId}-${resumeData.formatting.colorTheme}-${resumeData.formatting.bulletStyle}-${resumeData.basics.name}`}
                style={{
                    width: '816px',
                    height: '1056px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    marginLeft: `${-(816 * scale) / 2}px`,
                    overflow: 'hidden',
                    maxHeight: '1056px',
                    backgroundColor: 'white',
                    color: 'black',
                }}
            >
                <TemplateRenderer templateId={templateId} />
            </div>
        </div>
    );
}
