import { memo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import type { TemplateId, DocumentType } from '../../types';

// Dynamically import PDF templates
import { ClassicPDFTemplate } from '../../templates/pdf/ClassicPDFTemplate';
import { ModernPDFTemplate } from '../../templates/pdf/ModernPDFTemplate';
import { CoverLetterPDFTemplate } from '../../templates/pdf/CoverLetterPDFTemplate';

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();

    // Map template ID to the corresponding component
    const getTemplateComponent = () => {
        if (documentType === 'coverletter') {
            return <CoverLetterPDFTemplate data={coverLetterData} />;
        }

        switch (templateId) {
            case 1:
                return <ClassicPDFTemplate data={resumeData} />;
            case 2:
                return <ModernPDFTemplate data={resumeData} />;
            default:
                return <ModernPDFTemplate data={resumeData} />;
        }
    };

    return (
        <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full h-full bg-white pdf-paper shadow-2xl relative">
                <PDFViewer
                    width="100%"
                    height="100%"
                    showToolbar={false}
                    style={{ border: 'none', backgroundColor: '#ffffff' }}
                    key={documentType === 'coverletter'
                        ? `cl-${coverLetterData.company}-${coverLetterData.position}-${JSON.stringify(coverLetterData).length}`
                        : `res-${templateId}-${resumeData.formatting.colorTheme}-${resumeData.basics.name}-${resumeData.sections.join(',')}-${resumeData.customSections.length}`}
                >
                    {getTemplateComponent()}
                </PDFViewer>
            </div>
        </div>
    );
});
