import { PDFThumbnail } from './PDFThumbnail';
import type { TemplateId } from '../../types';

interface TemplateThumbnailProps {
    templateId: TemplateId;
}

/**
 * TemplateThumbnail renders a high-fidelity preview of a resume template.
 * Powered by the actual PDF template rendered to canvas via pdfjs-dist.
 */
export function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
    return (
        <div className="w-full relative overflow-hidden bg-white pdf-paper select-none pointer-events-none">
            <PDFThumbnail templateId={templateId} />
        </div>
    );
}
