import { TemplateRenderer } from '../../templates/html/TemplateRenderer';
import { useResumeStore } from '../../store';
import type { TemplateId } from '../../types';

interface TemplateThumbnailProps {
    templateId: TemplateId;
}

/**
 * TemplateThumbnail renders a scaled-down preview of a resume template.
 * Subscribing to resumeData ensures the thumbnail re-renders when formatting changes.
 */
export function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
    // Subscribe to resumeData to trigger re-renders on formatting/data changes
    const { resumeData } = useResumeStore();

    return (
        <div className="w-full h-full relative overflow-hidden bg-white pdf-paper select-none pointer-events-none">
            <div
                // Force re-render on data changes with key
                key={`${templateId}-${resumeData.formatting.colorTheme}-${resumeData.formatting.bulletStyle}-${resumeData.basics.name}`}
                style={{
                    width: '816px', // 8.5in at 96dpi
                    height: '1056px', // 11in at 96dpi
                    transform: 'scale(0.55)', // Increased to fill card better
                    transformOrigin: 'top center',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    marginLeft: '-408px', // Center the scaled content
                    overflow: 'hidden', // Clip content past first page
                    maxHeight: '1056px', // Enforce 11-inch limit
                }}
            >
                <TemplateRenderer templateId={templateId} />
            </div>
        </div>
    );
}
