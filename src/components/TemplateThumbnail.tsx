import { TemplateRenderer } from '../templates/TemplateRenderer';
import type { TemplateId } from '../types';

interface TemplateThumbnailProps {
    templateId: TemplateId;
}

export function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
    return (
        <div className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none">
            <div
                style={{
                    width: '816px', // A4 width
                    height: '1056px', // A4 height
                    transform: 'scale(0.55)', // Increased from 0.28 to fill card width
                    transformOrigin: 'top center',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    marginLeft: '-408px', // Center the scaled content
                }}
            >
                <TemplateRenderer templateId={templateId} />
            </div>
        </div>
    );
}
