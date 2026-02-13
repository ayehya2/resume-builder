import { memo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/templateResolver';
import type { TemplateId, DocumentType } from '../../types';

// Dynamically import PDF templates
import { ClassicPDFTemplate } from '../../templates/pdf/ClassicPDFTemplate';
import { ModernPDFTemplate } from '../../templates/pdf/ModernPDFTemplate';
import { MinimalPDFTemplate } from '../../templates/pdf/MinimalPDFTemplate';
import { ExecutivePDFTemplate } from '../../templates/pdf/ExecutivePDFTemplate';
import { CreativePDFTemplate } from '../../templates/pdf/CreativePDFTemplate';
import { TechnicalPDFTemplate } from '../../templates/pdf/TechnicalPDFTemplate';
import { ElegantPDFTemplate } from '../../templates/pdf/ElegantPDFTemplate';
import { CompactPDFTemplate } from '../../templates/pdf/CompactPDFTemplate';
import { AcademicPDFTemplate } from '../../templates/pdf/AcademicPDFTemplate';
import { LaTeXPDFTemplate } from '../../templates/pdf/LaTeXPDFTemplate';
import { CoverLetterPDFTemplate } from '../../templates/pdf/CoverLetterPDFTemplate';

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    // Resolve custom templates: get base template ID + effective formatting
    const effectiveData = getEffectiveResumeData(resumeData, customTemplates);

    // Map template ID to the corresponding component
    const getTemplateComponent = () => {
        if (documentType === 'coverletter') {
            return <CoverLetterPDFTemplate data={coverLetterData} />;
        }

        switch (effectiveData.selectedTemplate) {
            case 1:
                return <ClassicPDFTemplate data={effectiveData} />;
            case 2:
                return <ModernPDFTemplate data={effectiveData} />;
            case 3:
                return <MinimalPDFTemplate data={effectiveData} />;
            case 4:
                return <ExecutivePDFTemplate data={effectiveData} />;
            case 5:
                return <CreativePDFTemplate data={effectiveData} />;
            case 6:
                return <TechnicalPDFTemplate data={effectiveData} />;
            case 7:
                return <ElegantPDFTemplate data={effectiveData} />;
            case 8:
                return <CompactPDFTemplate data={effectiveData} />;
            case 9:
                return <AcademicPDFTemplate data={effectiveData} />;
            case 10:
                return <LaTeXPDFTemplate data={effectiveData} />;
            default:
                return <ClassicPDFTemplate data={effectiveData} />;
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
                        : `res-${templateId}-${effectiveData.formatting.colorTheme}-${effectiveData.basics.name}-${effectiveData.sections.join(',')}-${effectiveData.customSections.length}`}
                >
                    {getTemplateComponent()}
                </PDFViewer>
            </div>
        </div>
    );
});

