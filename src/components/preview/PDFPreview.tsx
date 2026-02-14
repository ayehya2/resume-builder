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
import {
    Download, Printer, ZoomIn, ZoomOut, Maximize, RotateCw,
    ChevronLeft, ChevronRight, Info, PanelLeft, Search, X
} from 'lucide-react';

/* ──────────────────────────────────────
   Types & Helpers
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
   Component
   ────────────────────────────────────── */

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    // PDF blob
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);

    // Viewer state
    const [scale, setScale] = useState<number | null>(null); // null = auto fit-to-width
    const [rotation, setRotation] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // UI panels
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showProperties, setShowProperties] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState<Record<string, string>>({});

    // Thumbnails
    const [thumbnails, setThumbnails] = useState<string[]>([]);

    // Dark mode
    const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setDarkMode(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const pdfDocRef = useRef<any>(null);

    const effectiveScale = scale ?? 1.0;

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
                console.error('[PDFPreview] Generation failed:', err);
                setError(err instanceof Error ? err.message : 'PDF generation failed');
            } finally {
                if (gen === generationRef.current) setIsGenerating(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, templateId, documentType, coverLetterData, customLatexSource, customTemplates, latexFormatting]);

    /* ── Render PDF pages to canvas with TextLayer ── */
    useEffect(() => {
        if (!pdfBlob) return;
        let cancelled = false;

        (async () => {
            try {
                const pdfjsLib = await getPdfjsLib();
                const arrayBuffer = await pdfBlob.arrayBuffer();
                const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                if (cancelled) { doc.destroy(); return; }

                // Cleanup previous doc
                if (pdfDocRef.current) {
                    try { pdfDocRef.current.destroy(); } catch { /* */ }
                }
                pdfDocRef.current = doc;

                setTotalPages(doc.numPages);

                // Get metadata
                try {
                    const meta = await doc.getMetadata();
                    const info: any = meta?.info || {};
                    const md: Record<string, string> = {};
                    if (info.Title) md['Title'] = info.Title;
                    if (info.Author) md['Author'] = info.Author;
                    if (info.Creator) md['Creator'] = info.Creator;
                    if (info.Producer) md['Producer'] = info.Producer;
                    md['Pages'] = String(doc.numPages);

                    const page1 = await doc.getPage(1);
                    const vp = page1.getViewport({ scale: 1 });
                    const wIn = (vp.width / 72).toFixed(2);
                    const hIn = (vp.height / 72).toFixed(2);
                    md['Page Size'] = `${wIn}" × ${hIn}" (${Math.round(vp.width)} × ${Math.round(vp.height)} pts)`;
                    setPdfMetadata(md);
                } catch { /* ignore metadata errors */ }

                // Calculate fit-to-width scale
                if (scale === null && containerRef.current) {
                    const page1 = await doc.getPage(1);
                    const vp1 = page1.getViewport({ scale: 1, rotation });
                    const containerWidth = containerRef.current.clientWidth - 40; // padding
                    const fitScale = containerWidth / vp1.width;
                    setScale(Math.min(Math.max(fitScale, 0.3), 3.0));
                    return; // The scale change will re-trigger this effect
                }

                const container = containerRef.current;
                if (!container || cancelled) return;

                // Clear existing pages
                container.innerHTML = '';

                const dpr = window.devicePixelRatio || 1;

                // Generate thumbnails
                const thumbs: string[] = [];

                for (let i = 1; i <= doc.numPages; i++) {
                    const page = await doc.getPage(i);
                    if (cancelled) return;

                    const viewport = page.getViewport({ scale: effectiveScale, rotation });

                    // Page wrapper
                    const pageWrapper = document.createElement('div');
                    pageWrapper.className = 'pdf-page-wrapper';
                    pageWrapper.style.cssText = `
                        position: relative;
                        width: ${Math.floor(viewport.width)}px;
                        height: ${Math.floor(viewport.height)}px;
                        margin: 12px auto;
                        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
                        background: white;
                        overflow: hidden;
                    `;
                    pageWrapper.dataset.pageNum = String(i);

                    // Canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.floor(viewport.width * dpr);
                    canvas.height = Math.floor(viewport.height * dpr);
                    canvas.style.width = `${Math.floor(viewport.width)}px`;
                    canvas.style.height = `${Math.floor(viewport.height)}px`;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] as [number, number, number, number, number, number] : undefined;
                        await page.render({ canvasContext: ctx, canvas, viewport, transform } as any).promise;
                    }
                    pageWrapper.appendChild(canvas);

                    // TextLayer — for text selection
                    try {
                        const textContent = await page.getTextContent();
                        const textDiv = document.createElement('div');
                        textDiv.className = 'pdf-text-layer';
                        textDiv.style.cssText = `
                            position: absolute;
                            top: 0; left: 0;
                            width: ${Math.floor(viewport.width)}px;
                            height: ${Math.floor(viewport.height)}px;
                            overflow: hidden;
                            line-height: 1.0;
                            opacity: 1;
                        `;

                        const TextLayerCls = pdfjsLib.TextLayer;
                        if (TextLayerCls) {
                            const tl = new TextLayerCls({
                                textContentSource: textContent,
                                container: textDiv,
                                viewport: viewport,
                            });
                            await tl.render();
                        }
                        pageWrapper.appendChild(textDiv);
                    } catch (e) {
                        console.warn('[PDFPreview] TextLayer failed for page', i, e);
                    }

                    // AnnotationLayer — for clickable links
                    try {
                        const annotations = await page.getAnnotations();
                        if (annotations.length > 0) {
                            const linkDiv = document.createElement('div');
                            linkDiv.className = 'pdf-link-layer';
                            linkDiv.style.cssText = `
                                position: absolute;
                                top: 0; left: 0;
                                width: ${Math.floor(viewport.width)}px;
                                height: ${Math.floor(viewport.height)}px;
                                overflow: hidden;
                            `;

                            for (const ann of annotations) {
                                if (ann.subtype !== 'Link' || !ann.url) continue;
                                const rect = ann.rect;
                                if (!rect || rect.length < 4) continue;

                                // Convert PDF coordinates to viewport coordinates
                                const [x1, y1, x2, y2] = pdfjsLib.Util.normalizeRect(
                                    viewport.convertToViewportRectangle(rect)
                                );

                                const a = document.createElement('a');
                                a.href = ann.url;
                                a.target = '_blank';
                                a.rel = 'noopener noreferrer';
                                a.title = ann.url;
                                a.style.cssText = `
                                    position: absolute;
                                    left: ${x1}px;
                                    top: ${y1}px;
                                    width: ${x2 - x1}px;
                                    height: ${y2 - y1}px;
                                    cursor: pointer;
                                `;
                                linkDiv.appendChild(a);
                            }
                            pageWrapper.appendChild(linkDiv);
                        }
                    } catch (e) {
                        console.warn('[PDFPreview] Annotations failed for page', i, e);
                    }

                    container.appendChild(pageWrapper);

                    // Generate thumbnail
                    try {
                        const thumbScale = 0.25;
                        const thumbVP = page.getViewport({ scale: thumbScale, rotation });
                        const thumbCanvas = document.createElement('canvas');
                        thumbCanvas.width = thumbVP.width;
                        thumbCanvas.height = thumbVP.height;
                        const thumbCtx = thumbCanvas.getContext('2d');
                        if (thumbCtx) {
                            await page.render({ canvasContext: thumbCtx, canvas: thumbCanvas, viewport: thumbVP } as any).promise;
                            thumbs.push(thumbCanvas.toDataURL('image/png'));
                        }
                    } catch { /* thumbnail generation optional */ }
                }

                if (!cancelled) setThumbnails(thumbs);

            } catch (err) {
                if (!cancelled) {
                    console.error('[PDFPreview] Render error:', err);
                    setError(err instanceof Error ? err.message : 'Render failed');
                }
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfBlob, effectiveScale, rotation]);

    /* ── Page tracking via scroll ── */
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const onScroll = () => {
            const wrappers = el.querySelectorAll('.pdf-page-wrapper');
            const scrollTop = el.scrollTop + el.clientHeight / 3;
            for (let i = 0; i < wrappers.length; i++) {
                const wrapper = wrappers[i] as HTMLElement;
                if (wrapper.offsetTop + wrapper.offsetHeight > scrollTop) {
                    setCurrentPage(i + 1);
                    break;
                }
            }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, [totalPages]);

    /* ── Zoom ── */
    const handleZoomIn = useCallback(() => setScale(s => Math.min((s ?? 1) + 0.15, 4.0)), []);
    const handleZoomOut = useCallback(() => setScale(s => Math.max((s ?? 1) - 0.15, 0.25)), []);
    const handleFitToWidth = useCallback(() => setScale(null), []);

    /* ── Rotate ── */
    const handleRotate = useCallback(() => setRotation(r => (r + 90) % 360), []);

    /* ── Navigate pages ── */
    const goToPage = useCallback((page: number) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const wrappers = el.querySelectorAll('.pdf-page-wrapper');
        if (page >= 1 && page <= wrappers.length) {
            (wrappers[page - 1] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
            setCurrentPage(page);
        }
    }, []);

    /* ── Download ── */
    const handleDownload = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${downloadFileName}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }, [pdfBlob, downloadFileName]);

    /* ── Print ── */
    const handlePrint = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
            try {
                iframe.contentWindow?.print();
            } catch {
                window.open(url, '_blank');
            }
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url);
            }, 3000);
        };
    }, [pdfBlob]);

    /* ── Theme-aware classes ── */
    const toolbarBg = darkMode ? 'bg-[--sidebar-bg]' : 'bg-slate-100';
    const toolbarBorder = darkMode ? 'border-[--sidebar-border]' : 'border-slate-300';
    const textP = darkMode ? 'text-white' : 'text-slate-900';
    const textM = darkMode ? 'text-slate-400' : 'text-slate-500';
    const btnCls = darkMode
        ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300';
    const bodyBg = darkMode ? 'bg-slate-800' : 'bg-slate-300';
    const scrollBg = darkMode ? 'bg-slate-900' : 'bg-slate-200';

    /* ── Error state ── */
    if (error && !pdfBlob) {
        return (
            <div className={`w-full h-full ${bodyBg} flex items-center justify-center p-8`}>
                <div className="max-w-lg text-center">
                    <h3 className="text-lg font-bold text-red-500 mb-2">
                        {isLatexTemplate(templateId) ? 'LaTeX Compilation Error' : 'PDF Generation Error'}
                    </h3>
                    <pre className="text-xs text-left bg-red-900/30 border-2 border-red-800 p-4 overflow-auto max-h-48 text-red-300 mb-4 whitespace-pre-wrap">{error}</pre>
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className={`${btnCls} px-4 py-2 text-sm font-bold`}>Retry</button>
                </div>
            </div>
        );
    }

    /* ── Loading state ── */
    if (!pdfBlob) {
        return (
            <div className={`w-full h-full ${bodyBg} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className={`text-sm font-semibold ${textM}`}>
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    const zoomPercent = Math.round(effectiveScale * 100);

    return (
        <div className={`w-full h-full flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            {/* ── Toolbar ── */}
            <div className={`flex items-center justify-between px-2 py-1.5 border-b-2 flex-shrink-0 ${toolbarBg} ${toolbarBorder}`}>
                {/* Left: filename + page nav */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-semibold truncate max-w-[160px] ${textP}`} title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {isGenerating && (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    )}
                    {totalPages > 0 && (
                        <div className="flex items-center gap-0.5 ml-1">
                            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}
                                className={`${btnCls} p-1 disabled:opacity-30`}><ChevronLeft size={13} /></button>
                            <span className={`text-[11px] font-semibold px-1 ${textP}`}>
                                {currentPage} / {totalPages}
                            </span>
                            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}
                                className={`${btnCls} p-1 disabled:opacity-30`}><ChevronRight size={13} /></button>
                        </div>
                    )}
                </div>

                {/* Center: zoom + rotate */}
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowSearch(v => !v)} className={`${btnCls} p-1.5`} title="Search"><Search size={13} /></button>
                    <div className="w-px h-5 bg-slate-500/30 mx-0.5" />
                    <button onClick={handleZoomOut} className={`${btnCls} p-1.5`} title="Zoom Out"><ZoomOut size={13} /></button>
                    <span className={`text-[11px] font-bold min-w-[40px] text-center ${textP}`}>{zoomPercent}%</span>
                    <button onClick={handleZoomIn} className={`${btnCls} p-1.5`} title="Zoom In"><ZoomIn size={13} /></button>
                    <button onClick={handleFitToWidth} className={`${btnCls} p-1.5`} title="Fit to Width"><Maximize size={13} /></button>
                    <div className="w-px h-5 bg-slate-500/30 mx-0.5" />
                    <button onClick={handleRotate} className={`${btnCls} p-1.5`} title="Rotate"><RotateCw size={13} /></button>
                </div>

                {/* Right: tools + download */}
                <div className="flex items-center gap-1">
                    <button onClick={() => setShowThumbnails(v => !v)}
                        className={`${btnCls} p-1.5 ${showThumbnails ? 'ring-2 ring-blue-500' : ''}`}
                        title="Thumbnails"><PanelLeft size={13} /></button>
                    <button onClick={() => setShowProperties(v => !v)}
                        className={`${btnCls} p-1.5 ${showProperties ? 'ring-2 ring-blue-500' : ''}`}
                        title="Properties"><Info size={13} /></button>
                    <div className="w-px h-5 bg-slate-500/30 mx-0.5" />
                    <button onClick={handlePrint} className={`${btnCls} p-1.5`} title="Print"><Printer size={13} /></button>
                    <button onClick={handleDownload} className="btn-accent flex items-center gap-1 px-2 py-1.5 text-xs font-bold"
                        title="Download"><Download size={13} /></button>
                </div>
            </div>

            {/* ── Search bar ── */}
            {showSearch && (
                <div className={`flex items-center gap-2 px-3 py-2 border-b ${toolbarBg} ${toolbarBorder}`}>
                    <Search size={14} className={textM} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search in document..."
                        className={`flex-1 text-sm px-2 py-1 border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        autoFocus
                    />
                    <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className={`${btnCls} p-1`}><X size={14} /></button>
                </div>
            )}

            {/* ── Error banner (stale data + error) ── */}
            {error && (
                <div className="bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center flex-shrink-0">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-2 underline hover:no-underline text-red-300">Retry</button>
                </div>
            )}

            {/* ── Main body: thumbnails sidebar + pages ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails sidebar */}
                {showThumbnails && (
                    <div className={`w-36 flex-shrink-0 border-r overflow-y-auto p-2 space-y-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}>
                        {thumbnails.map((thumb, idx) => (
                            <button key={idx} onClick={() => goToPage(idx + 1)}
                                className={`block w-full border-2 transition-all ${currentPage === idx + 1 ? 'border-blue-500 shadow-lg' : darkMode ? 'border-slate-600 hover:border-slate-400' : 'border-slate-300 hover:border-slate-400'}`}>
                                <img src={thumb} alt={`Page ${idx + 1}`} className="w-full" />
                                <div className={`text-[9px] font-bold text-center py-0.5 ${textM}`}>{idx + 1}</div>
                            </button>
                        ))}
                        {thumbnails.length === 0 && totalPages > 0 && (
                            <div className={`text-[10px] text-center py-4 ${textM}`}>Loading thumbnails...</div>
                        )}
                    </div>
                )}

                {/* PDF pages */}
                <div ref={scrollContainerRef} className={`flex-1 overflow-auto ${scrollBg}`}>
                    <div ref={containerRef} className="py-4" />
                </div>
            </div>

            {/* ── Properties modal ── */}
            {showProperties && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowProperties(false)}>
                    <div className={`${darkMode ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-900 border-slate-300'} border-2 shadow-2xl max-w-sm w-full mx-4`}
                        onClick={e => e.stopPropagation()}>
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                            <h3 className="font-bold text-sm">Document Properties</h3>
                            <button onClick={() => setShowProperties(false)}
                                className={`${btnCls} p-1`}><X size={14} /></button>
                        </div>
                        <div className="p-4 space-y-2">
                            {Object.entries(pdfMetadata).map(([k, v]) => (
                                <div key={k} className="flex justify-between text-xs">
                                    <span className={`font-semibold ${textM}`}>{k}:</span>
                                    <span className={`text-right max-w-[200px] truncate ${textP}`} title={v}>{v}</span>
                                </div>
                            ))}
                            {Object.keys(pdfMetadata).length === 0 && (
                                <p className={`text-xs ${textM}`}>No metadata available.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
