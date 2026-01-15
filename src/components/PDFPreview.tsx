import { PDFViewer } from '@react-pdf/renderer';
import { useResumeStore } from '../store';
import { ModernPDFTemplate } from '../pdf-templates/ModernPDFTemplate';
import { ClassicPDFTemplate } from '../pdf-templates/ClassicPDFTemplate';
import { TechnicalPDFTemplate } from '../pdf-templates/TechnicalPDFTemplate';
import { ExecutivePDFTemplate } from '../pdf-templates/ExecutivePDFTemplate';
import type { TemplateId } from '../types';

interface PDFPreviewProps {
    templateId: TemplateId;
}

/**
 * PDFPreview component displays an embedded PDF viewer showing the resume.
 * Uses @react-pdf/renderer's PDFViewer for true WYSIWYG preview.
 */
export function PDFPreview({ templateId }: PDFPreviewProps) {
    // Get resume data from store HERE (not inside PDF components)
    const { resumeData } = useResumeStore();

    // Map template ID to the correct PDF template component
    const getPDFTemplate = () => {
        switch (templateId) {
            case 1: // Classic
                return <ClassicPDFTemplate data={resumeData} />;
            case 2: // Modern
                return <ModernPDFTemplate data={resumeData} />;
            case 3: // Technical
                return <TechnicalPDFTemplate data={resumeData} />;
            case 4: // Executive
                return <ExecutivePDFTemplate data={resumeData} />;
            default:
                return <ModernPDFTemplate data={resumeData} />;
        }
    };

    return (
        <PDFViewer
            key={`${templateId}-${resumeData.basics.name}`} // Force re-mount on template OR data change
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
            }}
            showToolbar={false}
        >
            {getPDFTemplate()}
        </PDFViewer>
    );
}
