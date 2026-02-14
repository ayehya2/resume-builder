import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
// useRef still used for previousDataRef + generationRef
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
import {
    Download, Printer, ZoomIn, ZoomOut, Maximize,
    ChevronLeft, ChevronRight, Info, PanelLeft, X
} from 'lucide-react';

/* ──────────────────────────────────────
   Helpers
   ────────────────────────────────────── */

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

async function getPdfjsLib() {
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
    return pdfjsLib;
}

/* ──────────────────────────────────────
   Native PDF Preview — Custom Themed Toolbar
   
   Uses browser's built-in PDF renderer via <iframe> for:
     • Perfect text selection
     • Crisp vector rendering at any zoom
     • Clickable links
     • Ctrl+scroll zoom (handled natively inside iframe)
   
   Native toolbar hidden with #toolbar=0.
   Our zoom buttons reload the iframe with #zoom=X.
   ────────────────────────────────────── */

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    // PDF generation
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);

    // Viewer state — zoom=0 means "fit to width"
    const [zoom, setZoom] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // UI panels
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [showProperties, setShowProperties] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState<Record<string, string>>({});
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    const iframeRef = useRef<HTMLIFrameElement>(null);

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

    /* ── Metadata + thumbnails ── */
    useEffect(() => {
        if (!pdfBlob) return;
        let cancelled = false;
        (async () => {
            try {
                const pdfjsLib = await getPdfjsLib();
                const ab = await pdfBlob.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: ab }).promise;
                if (cancelled) { doc.destroy(); return; }
                setTotalPages(doc.numPages);
                setCurrentPage(1);

                // Metadata
                try {
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
                } catch { /* */ }

                // Thumbnails
                const thumbs: string[] = [];
                for (let i = 1; i <= doc.numPages; i++) {
                    if (cancelled) break;
                    try {
                        const page = await doc.getPage(i);
                        const vp = page.getViewport({ scale: 0.25 });
                        const c = document.createElement('canvas');
                        c.width = vp.width; c.height = vp.height;
                        const ctx = c.getContext('2d');
                        if (ctx) {
                            await page.render({ canvasContext: ctx, canvas: c, viewport: vp } as any).promise;
                            thumbs.push(c.toDataURL('image/png'));
                        }
                    } catch { /* */ }
                }
                if (!cancelled) setThumbnails(thumbs);
                doc.destroy();
            } catch { /* */ }
        })();
        return () => { cancelled = true; };
    }, [pdfBlob]);

    /* ── Iframe src ──
       Computed from pdfUrl + zoom + currentPage.
       The iframe key includes zoom + page so React remounts it
       exactly ONCE per change. No imperative navigation needed. */
    const iframeSrc = useMemo(() => {
        if (!pdfUrl) return '';
        const parts = ['toolbar=0', 'navpanes=0'];
        if (zoom === 0) parts.push('view=FitH');
        else parts.push(`zoom=${zoom}`);
        if (currentPage > 1) parts.push(`page=${currentPage}`);
        return `${pdfUrl}#${parts.join('&')}`;
    }, [pdfUrl, zoom, currentPage]);

    const iframeKey = `${pdfUrl}|${zoom}|${currentPage}`;

    /* ── Zoom controls ── */
    const handleZoomIn = useCallback(() => {
        setZoom(z => {
            const cur = z === 0 ? 100 : z;
            return Math.min(cur + 25, 500);
        });
    }, []);
    const handleZoomOut = useCallback(() => {
        setZoom(z => {
            const cur = z === 0 ? 100 : z;
            return Math.max(cur - 25, 25);
        });
    }, []);
    const handleFitToWidth = useCallback(() => setZoom(0), []);

    /* ── Page nav ── */
    const goToPage = useCallback((p: number) => {
        if (p < 1 || p > totalPages) return;
        setCurrentPage(p);
    }, [totalPages]);

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
    const btnOn: React.CSSProperties = { ...btn, outline: '2px solid var(--accent)', outlineOffset: '-2px' };

    const zoomLabel = zoom === 0 ? 'Fit' : `${zoom}%`;

    /* ── Error ── */
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
            {/* ━━ Toolbar ━━ */}
            <div className="flex flex-wrap items-center justify-between px-2 py-1.5 border-b-2 flex-shrink-0 gap-y-2 gap-x-1" style={toolbarBg}>
                {/* Left: filename + page nav */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="hidden sm:inline text-xs font-semibold truncate max-w-[120px]" style={txt}
                        title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {isGenerating && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-t-transparent rounded-full flex-shrink-0"
                            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    )}
                    {totalPages > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                                className="p-1 border transition-colors disabled:opacity-30" style={btn}>
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-[11px] font-bold px-1 tabular-nums" style={txt}>
                                {currentPage}/{totalPages}
                            </span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                                className="p-1 border transition-colors disabled:opacity-30" style={btn}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Center: zoom + fit */}
                <div className="flex items-center gap-1 order-3 sm:order-none w-full sm:w-auto justify-center sm:justify-start">
                    <button onClick={handleZoomOut} className="p-2 sm:p-1.5 border transition-colors" style={btn} title="Zoom Out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-[11px] font-bold min-w-[36px] text-center select-none tabular-nums" style={txt}>
                        {zoomLabel}
                    </span>
                    <button onClick={handleZoomIn} className="p-2 sm:p-1.5 border transition-colors" style={btn} title="Zoom In">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToWidth} className="p-2 sm:p-1.5 border transition-colors"
                        style={zoom === 0 ? btnOn : btn} title="Fit to Width">
                        <Maximize size={16} />
                    </button>
                </div>

                {/* Right: thumbnails, properties, print, download */}
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowThumbnails(v => !v)} className="p-2 sm:p-1.5 border transition-colors"
                        style={showThumbnails ? btnOn : btn} title="Thumbnails">
                        <PanelLeft size={16} strokeWidth={showThumbnails ? 3 : 2} />
                    </button>
                    <button onClick={() => setShowProperties(v => !v)} className="hidden sm:block p-1.5 border transition-colors"
                        style={showProperties ? btnOn : btn} title="Document Properties">
                        <Info size={16} />
                    </button>
                    <div className="hidden sm:block w-px h-5 mx-0.5" style={{ backgroundColor: 'var(--card-border)' }} />
                    <button onClick={handlePrint} className="p-2 sm:p-1.5 border transition-colors" style={btn} title="Print">
                        <Printer size={16} />
                    </button>
                    <button onClick={handleDownload} className="btn-accent flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                        title="Download PDF">
                        <Download size={14} strokeWidth={3} />
                        <span className="hidden xs:inline">PDF</span>
                    </button>
                </div>
            </div>

            {/* ━━ Error banner (stale) ━━ */}
            {error && (
                <div className="bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center flex-shrink-0">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-2 underline text-red-300">Retry</button>
                </div>
            )}

            {/* ━━ Body: thumbnails + PDF ━━ */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnail sidebar */}
                {showThumbnails && (
                    <div className="w-36 flex-shrink-0 border-r overflow-y-auto p-2 space-y-2"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                        {thumbnails.map((src, i) => (
                            <button key={i} onClick={() => goToPage(i + 1)}
                                className="block w-full border-2 transition-all"
                                style={{ borderColor: currentPage === i + 1 ? 'var(--accent)' : 'var(--card-border)' }}>
                                <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                                <div className="text-[9px] font-bold text-center py-0.5" style={txtM}>{i + 1}</div>
                            </button>
                        ))}
                        {thumbnails.length === 0 && totalPages > 0 && (
                            <div className="text-[10px] text-center py-4" style={txtM}>Loading...</div>
                        )}
                    </div>
                )}

                {/* Native PDF iframe — full size, no CSS transforms */}
                <div className="flex-1 overflow-hidden">
                    {pdfUrl && (
                        <iframe
                            key={iframeKey}
                            ref={iframeRef}
                            src={iframeSrc}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    )}
                </div>
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
