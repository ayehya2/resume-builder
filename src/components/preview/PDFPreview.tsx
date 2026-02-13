import { memo } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/templateResolver';
import { getPDFTemplateComponent } from '../../lib/pdfTemplateMap';
import type { TemplateId, DocumentType } from '../../types';

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
                    {getPDFTemplateComponent(effectiveData, documentType, coverLetterData) as any}
                </PDFViewer>
            </div>
        </div>
    );
});

