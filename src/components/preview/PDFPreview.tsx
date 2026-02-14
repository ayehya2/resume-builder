import { useState, useEffect, useRef, memo } from 'react';
import { pdf } from '@react-pdf/renderer';
import equal from 'fast-deep-equal';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/templateResolver';
import { getPDFTemplateComponent, isLatexTemplate } from '../../lib/pdfTemplateMap';
import { generateLaTeXFromData } from '../../lib/latexGenerator';
import { compileLatexViaApi } from '../../lib/latexApiCompiler';
import type { TemplateId, DocumentType } from '../../types';

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);

    useEffect(() => {
        const currentState = {
            resumeData,
            templateId,
            documentType,
            coverLetterData,
            customLatexSource,
            latexFormatting,
        };

        if (previousDataRef.current && equal(currentState, previousDataRef.current) && pdfUrl) {
            return;
        }

        const currentGeneration = ++generationRef.current;

        const generatePDF = async () => {
            setIsGenerating(true);
            setError(null);

            try {
                const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
                let blob: Blob;

                if (isLatexTemplate(templateId) && documentType !== 'coverletter') {
                    const texSource = customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting);
                    blob = await compileLatexViaApi(texSource);
                } else {
                    const templateComponent = getPDFTemplateComponent(effectiveData, documentType, coverLetterData);
                    blob = await pdf(templateComponent as any).toBlob();
                }

                if (currentGeneration !== generationRef.current) return;

                if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                }

                const newUrl = URL.createObjectURL(blob);
                setPdfUrl(newUrl);
                previousDataRef.current = currentState;
            } catch (err) {
                if (currentGeneration !== generationRef.current) return;
                console.error('[PDFPreview] Generation failed:', err);
                setError(err instanceof Error ? err.message : 'PDF generation failed');
            } finally {
                if (currentGeneration === generationRef.current) {
                    setIsGenerating(false);
                }
            }
        };

        generatePDF();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, templateId, documentType, coverLetterData, customLatexSource, customTemplates, latexFormatting]);

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Error state
    if (error && !pdfUrl) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-8">
                <div className="max-w-lg text-center">
                    <h3 className="text-lg font-bold text-red-400 mb-2">
                        {isLatexTemplate(templateId) ? 'LaTeX Compilation Error' : 'PDF Generation Error'}
                    </h3>
                    <pre className="text-xs text-left bg-red-900/30 border-2 border-red-800 p-4 overflow-auto max-h-48 text-red-300 mb-4 whitespace-pre-wrap">
                        {error}
                    </pre>
                    <button
                        onClick={() => {
                            setError(null);
                            previousDataRef.current = null;
                        }}
                        className="px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 text-sm font-bold transition-colors"
                    >
                        Retry Compilation
                    </button>
                </div>
            </div>
        );
    }

    // Loading state
    if (!pdfUrl) {
        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm font-semibold text-slate-400">
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-slate-800 relative">
            {/* Loading overlay */}
            {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10 pointer-events-none">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="absolute top-0 left-0 right-0 z-20 bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center">
                    <strong>Error:</strong> {error}
                    <button
                        onClick={() => {
                            setError(null);
                            previousDataRef.current = null;
                        }}
                        className="ml-2 underline hover:no-underline text-red-300"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Full-bleed PDF iframe */}
            <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Resume Preview"
            />
        </div>
    );
});
