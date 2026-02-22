import { PDFThumbnail } from './PDFThumbnail';
import type { TemplateId, ResumeData, CoverLetterData } from '../../types';

interface TemplateThumbnailProps {
    templateId: TemplateId;
    previewData?: ResumeData | CoverLetterData;
    isCoverLetter?: boolean;
}

/**
 * TemplateThumbnail renders a high-fidelity preview of a resume template.
 * Powered by the actual PDF template rendered to canvas via pdfjs-dist.
 */
export function TemplateThumbnail({ templateId, previewData, isCoverLetter }: TemplateThumbnailProps) {
    return (
        <div className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none">
            <PDFThumbnail templateId={templateId} previewData={previewData} isCoverLetter={isCoverLetter} />
        </div>
    );
}
