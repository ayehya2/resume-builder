import { memo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useResumeStore } from '../../store';
import type { TemplateId } from '../../types';

// Dynamically import PDF templates
import { ClassicPDFTemplate } from '../../templates/pdf/ClassicPDFTemplate';
import { ModernPDFTemplate } from '../../templates/pdf/ModernPDFTemplate';

interface PDFPreviewProps {
    templateId: TemplateId;
}

export const PDFPreview = memo(function PDFPreview({ templateId }: PDFPreviewProps) {
    const { resumeData } = useResumeStore();

    // Map template ID to the corresponding component
    const getTemplateComponent = () => {
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
        <div className="w-full h-full">
            <PDFViewer
                width="100%"
                height="100%"
                showToolbar={false}
                key={`${templateId}-${resumeData.formatting.colorTheme}-${resumeData.basics.name}-${resumeData.sections.join(',')}`}
            >
                {getTemplateComponent()}
            </PDFViewer>
        </div>
    );
});
