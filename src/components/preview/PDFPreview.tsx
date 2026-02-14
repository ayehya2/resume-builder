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
import { Download, Printer, Info, X } from 'lucide-react';

/* ──────────────────────────────────────
   Native PDF Preview

   Uses browser's built-in PDF renderer via <iframe>.
   The native viewer provides:
     • Perfect text selection
     • Crisp vector rendering
     • Smooth zoom (Ctrl+scroll, pinch, buttons)
     • Page navigation
     • Search (Ctrl+F)
     • Clickable links

   We do NOT hide the native toolbar — it gives the user
   the exact same experience as opening a PDF in their browser.

   Our themed bar adds: filename, download, print, doc properties.
   ────────────────────────────────────── */

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);

    // Document properties
    const [showProperties, setShowProperties] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState<Record<string, string>>({});

    const downloadFileName = generateDocumentFileName({
        userName: resumeData.basics.name || '',
        documentType,
        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
    });

    /* ── Generate PDF blob ── */
    useEffect(() => {
        const currentState = { resumeData, templateId, documentType, coverLetterData, customLatexSource, latexFormatting };
        if (previousDataRef.current && equal(currentState, previousDataRef.current) && pdfBlob) return;
        const gen = ++generationRef.current;

        (async () => {
            setIsGenerating(true);
            setError(null);
            try {
                const effectiveData = getEffectiveResumeData(resumeData, customTemplates);
                let blob: Blob;
                if (isLatexTemplate(templateId) && documentType !== 'coverletter') {
                    const tex = customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting);
                    blob = await compileLatexViaApi(tex);
                } else {
                    const title = generateDocumentTitle({
                        userName: resumeData.basics.name || '',
                        documentType,
                        jobTitle: documentType === 'coverletter' ? coverLetterData.position : undefined,
                    });
                    const comp = getPDFTemplateComponent(effectiveData, documentType, coverLetterData, title);
                    blob = await pdf(comp as any).toBlob();
                }
                if (gen !== generationRef.current) return;
                setPdfBlob(blob);
                previousDataRef.current = currentState;
            } catch (err) {
                if (gen !== generationRef.current) return;
                setError(err instanceof Error ? err.message : 'PDF generation failed');
            } finally {
                if (gen === generationRef.current) setIsGenerating(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, templateId, documentType, coverLetterData, customLatexSource, customTemplates, latexFormatting]);

    /* ── Create / revoke blob URL ── */
    useEffect(() => {
        if (!pdfBlob) { setPdfUrl(null); return; }
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [pdfBlob]);

    /* ── Extract metadata (lightweight, for properties dialog) ── */
    useEffect(() => {
        if (!pdfBlob) return;
        let cancelled = false;
        (async () => {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                try {
                    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;
                } catch {
                    try {
                        const ver = pdfjsLib.version || '5.4.624';
                        pdfjsLib.GlobalWorkerOptions.workerSrc =
                            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${ver}/pdf.worker.min.mjs`;
                    } catch {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
                    }
                }
                const ab = await pdfBlob.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: ab }).promise;
                if (cancelled) { doc.destroy(); return; }

                const meta = await doc.getMetadata();
                const info: any = meta?.info || {};
                const md: Record<string, string> = {};
                if (info.Title) md['Title'] = info.Title;
                if (info.Author) md['Author'] = info.Author;
                if (info.Creator) md['Creator'] = info.Creator;
                if (info.Producer) md['Producer'] = info.Producer;
                md['Pages'] = String(doc.numPages);
                const p1 = await doc.getPage(1);
                const vp = p1.getViewport({ scale: 1 });
                md['Page Size'] = `${(vp.width / 72).toFixed(2)}" × ${(vp.height / 72).toFixed(2)}"`;
                if (!cancelled) setPdfMetadata(md);
                doc.destroy();
            } catch { /* */ }
        })();
        return () => { cancelled = true; };
    }, [pdfBlob]);

    /* ── Download ── */
    const handleDownload = useCallback(() => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${downloadFileName}.pdf`;
        a.click();
    }, [pdfUrl, downloadFileName]);

    /* ── Print ── */
    const handlePrint = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const f = document.createElement('iframe');
        f.style.display = 'none';
        f.src = url;
        document.body.appendChild(f);
        f.onload = () => {
            try { f.contentWindow?.print(); } catch { window.open(url, '_blank'); }
            setTimeout(() => { document.body.removeChild(f); URL.revokeObjectURL(url); }, 3000);
        };
    }, [pdfBlob]);

    /* ── Theme styles ── */
    const toolbarBg: React.CSSProperties = { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' };
    const txt: React.CSSProperties = { color: 'var(--main-text)' };
    const txtM: React.CSSProperties = { color: 'var(--main-text-secondary)' };
    const btn: React.CSSProperties = { backgroundColor: 'var(--input-bg)', color: 'var(--main-text)', borderColor: 'var(--input-border)' };

    /* ── Error (no PDF at all) ── */
    if (error && !pdfBlob) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="max-w-lg text-center">
                    <h3 className="text-lg font-bold text-red-500 mb-2">
                        {isLatexTemplate(templateId) ? 'LaTeX Compilation Error' : 'PDF Generation Error'}
                    </h3>
                    <pre className="text-xs text-left bg-red-900/30 border-2 border-red-800 p-4 overflow-auto max-h-48 text-red-300 mb-4 whitespace-pre-wrap">{error}</pre>
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="px-4 py-2 text-sm font-bold border" style={btn}>Retry</button>
                </div>
            </div>
        );
    }

    /* ── Loading ── */
    if (!pdfBlob) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-t-transparent rounded-full mx-auto mb-4"
                        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    <p className="text-sm font-semibold" style={txtM}>
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col" style={{ backgroundColor: 'var(--main-bg)' }}>
            {/* ━━ Themed header bar ━━ */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b-2 flex-shrink-0" style={toolbarBg}>
                {/* Left: filename + status */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold truncate max-w-[200px]" style={txt}
                        title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {isGenerating && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-t-transparent rounded-full flex-shrink-0"
                            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    )}
                </div>

                {/* Right: properties, print, download */}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setShowProperties(v => !v)}
                        className="p-1.5 border transition-colors" style={btn} title="Document Properties">
                        <Info size={14} />
                    </button>
                    <button onClick={handlePrint} className="p-1.5 border transition-colors" style={btn} title="Print">
                        <Printer size={14} />
                    </button>
                    <button onClick={handleDownload}
                        className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                        title="Download PDF">
                        <Download size={14} />
                        <span>Download</span>
                    </button>
                </div>
            </div>

            {/* ━━ Error banner (stale PDF still shown) ━━ */}
            {error && (
                <div className="bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center flex-shrink-0">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-2 underline text-red-300">Retry</button>
                </div>
            )}

            {/* ━━ PDF iframe — browser's native viewer handles everything ━━ */}
            <div className="flex-1 overflow-hidden">
                {pdfUrl && (
                    <iframe
                        key={pdfUrl}
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                    />
                )}
            </div>

            {/* ━━ Properties modal ━━ */}
            {showProperties && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setShowProperties(false)}>
                    <div className="border-2 shadow-2xl max-w-sm w-full mx-4"
                        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--main-text)', borderColor: 'var(--card-border)' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-3 border-b"
                            style={{ borderColor: 'var(--card-border)' }}>
                            <h3 className="font-bold text-sm">Document Properties</h3>
                            <button onClick={() => setShowProperties(false)} className="p-1 border transition-colors" style={btn}>
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-2">
                            {Object.entries(pdfMetadata).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                    <span className="font-semibold" style={txtM}>{k}:</span>
                                    <span className="text-right max-w-[200px] truncate" style={txt} title={v}>{v}</span>
                                </div>
                            ))}
                            {Object.keys(pdfMetadata).length === 0 && (
                                <p className="text-xs" style={txtM}>No metadata available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
