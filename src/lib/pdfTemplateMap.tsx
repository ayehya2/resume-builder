import type { ReactElement } from 'react';
import type { ResumeData, CoverLetterData, DocumentType } from '../types';

import { ClassicPDFTemplate } from '../templates/ClassicPDFTemplate';
import { ModernPDFTemplate } from '../templates/ModernPDFTemplate';
import { MinimalPDFTemplate } from '../templates/MinimalPDFTemplate';
import { ExecutivePDFTemplate } from '../templates/ExecutivePDFTemplate';
import { CreativePDFTemplate } from '../templates/CreativePDFTemplate';
import { TechnicalPDFTemplate } from '../templates/TechnicalPDFTemplate';
import { ElegantPDFTemplate } from '../templates/ElegantPDFTemplate';
import { CompactPDFTemplate } from '../templates/CompactPDFTemplate';
import { AcademicPDFTemplate } from '../templates/AcademicPDFTemplate';
import { LaTeXPDFTemplate } from '../templates/LaTeXPDFTemplate';
import { CoverLetterPDFTemplate } from '../templates/CoverLetterPDFTemplate';

/**
 * Single source of truth for mapping a template ID to its PDF component.
 * Used by: PDFPreview (live viewer), handleDownloadPDF, and handlePrint.
 */
export function getPDFTemplateComponent(
    effectiveData: ResumeData,
    documentType: DocumentType,
    coverLetterData?: CoverLetterData
): ReactElement {
    if (documentType === 'coverletter' && coverLetterData) {
        return <CoverLetterPDFTemplate data={coverLetterData} />;
    }

    switch (effectiveData.selectedTemplate) {
        case 1: return <ClassicPDFTemplate data={effectiveData} />;
        case 2: return <ModernPDFTemplate data={effectiveData} />;
        case 3: return <MinimalPDFTemplate data={effectiveData} />;
        case 4: return <ExecutivePDFTemplate data={effectiveData} />;
        case 5: return <CreativePDFTemplate data={effectiveData} />;
        case 6: return <TechnicalPDFTemplate data={effectiveData} />;
        case 7: return <ElegantPDFTemplate data={effectiveData} />;
        case 8: return <CompactPDFTemplate data={effectiveData} />;
        case 9: return <AcademicPDFTemplate data={effectiveData} />;
        case 10: return <LaTeXPDFTemplate data={effectiveData} />;
        default: return <ClassicPDFTemplate data={effectiveData} />;
    }
}
