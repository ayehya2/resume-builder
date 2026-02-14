import { useState, useEffect, useRef, memo, useCallback } from 'react';
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
import { generateDocumentTitle, generateDocumentFileName } from '../../lib/documentNaming';
import { Download, Printer } from 'lucide-react';

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

/**
 * PDFPreview — uses the browser's native PDF viewer (via <iframe>)
 * for perfect text selection, clickable links, search, zoom, rotate,
 * document properties, and all standard PDF viewer features.
 */
export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);

    // Detect dark mode from <html> class
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const downloadFileName = generateDocumentFileName({
        userName: resumeData.basics.name || '',
        documentType,
        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
    });

    // ── Generate PDF blob ──
    useEffect(() => {
        const currentState = {
            resumeData, templateId, documentType,
            coverLetterData, customLatexSource, latexFormatting,
        };

        if (previousDataRef.current && equal(currentState, previousDataRef.current) && pdfBlob) return;

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
                    const docTitle = generateDocumentTitle({
                        userName: resumeData.basics.name || '',
                        documentType,
                        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
                    });
                    const templateComponent = getPDFTemplateComponent(effectiveData, documentType, coverLetterData, docTitle);
                    blob = await pdf(templateComponent as any).toBlob();
                }

                if (currentGeneration !== generationRef.current) return;
                setPdfBlob(blob);
                previousDataRef.current = currentState;
            } catch (err) {
                if (currentGeneration !== generationRef.current) return;
                console.error('[PDFPreview] Generation failed:', err);
                setError(err instanceof Error ? err.message : 'PDF generation failed');
            } finally {
                if (currentGeneration === generationRef.current) setIsGenerating(false);
            }
        };

        generatePDF();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, templateId, documentType, coverLetterData, customLatexSource, customTemplates, latexFormatting]);

    // ── Manage blob URL lifecycle ──
    useEffect(() => {
        if (!pdfBlob) {
            setBlobUrl(null);
            return;
        }
        const url = URL.createObjectURL(pdfBlob);
        setBlobUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pdfBlob]);

    // ── Download with custom filename ──
    const handleDownload = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${downloadFileName}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }, [pdfBlob, downloadFileName]);

    // ── Print via the embedded viewer ──
    const handlePrint = useCallback(() => {
        const iframe = document.getElementById('pdf-preview-frame') as HTMLIFrameElement | null;
        if (iframe?.contentWindow) {
            try {
                iframe.contentWindow.print();
            } catch {
                // Cross-origin fallback: open in new tab
                if (blobUrl) window.open(blobUrl, '_blank');
            }
        } else if (blobUrl) {
            window.open(blobUrl, '_blank');
        }
    }, [blobUrl]);

    // Theme-aware styles
    const barBg = darkMode ? 'bg-slate-950 border-slate-600' : 'bg-slate-100 border-slate-300';
    const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
    const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500';
    const btnClass = darkMode
        ? 'bg-slate-700 text-white hover:bg-slate-600'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300';

    // ── Error state ──
    if (error && !pdfBlob) {
        const bodyBg = darkMode ? 'bg-slate-900' : 'bg-slate-200';
        return (
            <div className={`w-full h-full ${bodyBg} flex items-center justify-center p-8`}>
                <div className="max-w-lg text-center">
                    <h3 className="text-lg font-bold text-red-500 mb-2">
                        {isLatexTemplate(templateId) ? 'LaTeX Compilation Error' : 'PDF Generation Error'}
                    </h3>
                    <pre className="text-xs text-left bg-red-900/30 border-2 border-red-800 p-4 overflow-auto max-h-48 text-red-300 mb-4 whitespace-pre-wrap">
                        {error}
                    </pre>
                    <button
                        onClick={() => { setError(null); previousDataRef.current = null; }}
                        className={`${btnClass} px-4 py-2 text-sm font-bold transition-colors`}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Loading state ──
    if (!blobUrl) {
        const bodyBg = darkMode ? 'bg-slate-900' : 'bg-slate-200';
        return (
            <div className={`w-full h-full ${bodyBg} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className={`text-sm font-semibold ${textMuted}`}>
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            {/* Minimal toolbar: filename + download/print */}
            <div className={`flex items-center justify-between px-3 py-1.5 border-b-2 flex-shrink-0 ${barBg}`}>
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-semibold truncate max-w-[220px] ${textPrimary}`} title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {isGenerating && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrint}
                        className={`${btnClass} flex items-center gap-1 px-2 py-1.5 text-xs font-bold transition-colors`}
                        title="Print"
                    >
                        <Printer size={14} />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn-accent flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold transition-colors"
                        title={`Download ${downloadFileName}.pdf`}
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">Download</span>
                    </button>
                </div>
            </div>

            {/* Error banner (stale data + error) */}
            {error && (
                <div className="bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center flex-shrink-0">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-2 underline hover:no-underline text-red-300">Retry</button>
                </div>
            )}

            {/* Native PDF viewer via iframe — gives perfect text selection, links, search, zoom, rotate */}
            <iframe
                id="pdf-preview-frame"
                src={blobUrl}
                className="flex-1 w-full border-none"
                title="PDF Preview"
            />
        </div>
    );
});
