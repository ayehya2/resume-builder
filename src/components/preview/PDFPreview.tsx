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
    Download, Printer, ZoomIn, ZoomOut, Maximize,
    RotateCw, Search, X, ChevronUp, ChevronDown
} from 'lucide-react';

interface PDFPreviewProps {
    templateId: TemplateId;
    documentType: DocumentType;
}

async function getPdfjsLib(): Promise<any> {
    const pdfjsLib = await import('pdfjs-dist');
    try {
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.href;
    } catch {
        try {
            const version = pdfjsLib.version || '5.4.624';
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
        } catch {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        }
    }
    return pdfjsLib;
}

const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
const btnBase = "p-1.5 bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const btnActive = "p-1.5 bg-blue-600 text-white hover:bg-blue-500 transition-colors";

export const PDFPreview = memo(function PDFPreview({ templateId, documentType }: PDFPreviewProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();
    const { customTemplates } = useCustomTemplateStore();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);

    // Search state
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMatches, setSearchMatches] = useState<{ page: number; el: HTMLElement }[]>([]);
    const [activeMatchIdx, setActiveMatchIdx] = useState(-1);

    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const previousDataRef = useRef<unknown>(null);
    const generationRef = useRef(0);
    const pdfDocRef = useRef<any>(null);
    const pageNaturalWidthRef = useRef<number>(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // ── Render all pages ──
    useEffect(() => {
        if (!pdfBlob) return;
        let cancelled = false;

        const renderAllPages = async () => {
            try {
                const pdfjsLib = await getPdfjsLib();
                const arrayBuffer = await pdfBlob.arrayBuffer();

                if (pdfDocRef.current) {
                    pdfDocRef.current.destroy();
                    pdfDocRef.current = null;
                }

                let pdfDoc: any;
                try {
                    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                } catch {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
                    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                }

                if (cancelled) { pdfDoc.destroy(); return; }

                pdfDocRef.current = pdfDoc;
                setNumPages(pdfDoc.numPages);

                // Clear search state since pages are being re-rendered
                clearHighlights();

                const container = pagesContainerRef.current;
                if (!container) return;
                container.innerHTML = '';

                const dpr = window.devicePixelRatio;

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    if (cancelled) return;

                    const page = await pdfDoc.getPage(i);

                    if (i === 1) {
                        const nv = page.getViewport({ scale: 1, rotation });
                        pageNaturalWidthRef.current = nv.width;
                    }

                    const renderViewport = page.getViewport({ scale: scale * dpr, rotation });
                    const cssW = renderViewport.width / dpr;
                    const cssH = renderViewport.height / dpr;

                    // Page wrapper with position relative for search highlights
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.width = `${cssW}px`;
                    wrapper.style.height = `${cssH}px`;
                    wrapper.style.marginBottom = '16px';
                    wrapper.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                    wrapper.dataset.pageNum = String(i);

                    // PDF canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = renderViewport.width;
                    canvas.height = renderViewport.height;
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.display = 'block';
                    canvas.style.backgroundColor = 'white';

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
                    }

                    wrapper.appendChild(canvas);

                    if (cancelled) return;
                    container.appendChild(wrapper);
                    page.cleanup();
                }
            } catch (err) {
                if (!cancelled) console.error('[PDFPreview] Render failed:', err);
            }
        };

        renderAllPages();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfBlob, scale, rotation]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (pdfDocRef.current) {
                pdfDocRef.current.destroy();
                pdfDocRef.current = null;
            }
        };
    }, []);

    // ── Search logic ──
    const clearHighlights = useCallback(() => {
        const container = pagesContainerRef.current;
        if (container) {
            container.querySelectorAll('.search-hl').forEach(el => el.remove());
        }
        setSearchMatches([]);
        setActiveMatchIdx(-1);
    }, []);

    const runSearch = useCallback(async () => {
        clearHighlights();

        const query = searchQuery.trim().toLowerCase();
        if (!query || !pdfDocRef.current) return;

        const container = pagesContainerRef.current;
        if (!container) return;

        const matches: { page: number; el: HTMLElement }[] = [];

        for (let pageNum = 1; pageNum <= pdfDocRef.current.numPages; pageNum++) {
            const page = await pdfDocRef.current.getPage(pageNum);
            const textContent = await page.getTextContent();

            // CSS viewport (matches wrapper dimensions)
            const cssViewport = page.getViewport({ scale, rotation });

            const wrapper = container.querySelector(`[data-page-num="${pageNum}"]`) as HTMLElement;
            if (!wrapper) { page.cleanup(); continue; }

            for (const item of textContent.items as any[]) {
                if (!item.str) continue;
                const text = item.str as string;
                const textLower = text.toLowerCase();
                if (!textLower.includes(query)) continue;

                const tx = item.transform[4];
                const ty = item.transform[5];

                // Convert PDF origin point to CSS viewport coords
                const [vx, vy] = cssViewport.convertToViewportPoint(tx, ty);

                // Full item dimensions in CSS pixels
                const itemHeight = (item.height || Math.abs(item.transform[3])) * scale;
                const itemWidth = (item.width || text.length * Math.abs(item.transform[3]) * 0.6) * scale;

                // Find ALL occurrences of query within this text item
                let searchStart = 0;
                while (true) {
                    const idx = textLower.indexOf(query, searchStart);
                    if (idx === -1) break;

                    // Calculate proportional offset and width for just the matched substring
                    const charRatio = text.length > 0 ? 1 / text.length : 0;
                    const matchLeft = vx + (idx * charRatio * itemWidth);
                    const matchWidth = query.length * charRatio * itemWidth;

                    const hl = document.createElement('div');
                    hl.className = 'search-hl';
                    hl.style.position = 'absolute';
                    hl.style.left = `${Math.max(0, matchLeft)}px`;
                    hl.style.top = `${Math.max(0, vy - itemHeight)}px`;
                    hl.style.width = `${matchWidth}px`;
                    hl.style.height = `${itemHeight + 2}px`;
                    hl.style.backgroundColor = 'rgba(255, 230, 0, 0.4)';
                    hl.style.border = '2px solid rgba(255, 160, 0, 0.8)';
                    hl.style.pointerEvents = 'none';
                    hl.style.zIndex = '5';
                    hl.style.mixBlendMode = 'multiply';

                    wrapper.appendChild(hl);
                    matches.push({ page: pageNum, el: hl });

                    searchStart = idx + 1; // continue searching for more occurrences
                }
            }

            page.cleanup();
        }

        setSearchMatches(matches);

        if (matches.length > 0) {
            setActiveMatchIdx(0);
            scrollToMatch(matches[0]);
        }
    }, [searchQuery, scale, rotation, clearHighlights]);

    const scrollToMatch = useCallback((match: { page: number; el: HTMLElement }) => {
        match.el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Flash the active match
        searchMatches.forEach(m => {
            m.el.style.backgroundColor = 'rgba(255, 230, 0, 0.4)';
            m.el.style.border = '2px solid rgba(255, 160, 0, 0.8)';
        });
        match.el.style.backgroundColor = 'rgba(255, 130, 0, 0.5)';
        match.el.style.border = '2px solid rgba(255, 80, 0, 1)';
    }, [searchMatches]);

    const handleSearchNav = useCallback((dir: 1 | -1) => {
        if (searchMatches.length === 0) return;
        const next = (activeMatchIdx + dir + searchMatches.length) % searchMatches.length;
        setActiveMatchIdx(next);
        scrollToMatch(searchMatches[next]);
    }, [searchMatches, activeMatchIdx, scrollToMatch]);

    const toggleSearch = useCallback(() => {
        if (searchOpen) {
            setSearchOpen(false);
            setSearchQuery('');
            clearHighlights();
        } else {
            setSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [searchOpen, clearHighlights]);

    // ── Actions ──
    const handleDownload = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${downloadFileName}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    }, [pdfBlob, downloadFileName]);

    const handlePrint = useCallback(() => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
    }, [pdfBlob]);

    const handleZoomIn = useCallback(() => {
        setScale(s => {
            const next = ZOOM_LEVELS.find(z => z > s + 0.01);
            return next ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(s => {
            const prev = [...ZOOM_LEVELS].reverse().find(z => z < s - 0.01);
            return prev ?? ZOOM_LEVELS[0];
        });
    }, []);

    const handleFitToPage = useCallback(() => {
        const container = scrollContainerRef.current;
        const pageWidth = pageNaturalWidthRef.current;
        if (!container || !pageWidth) return;
        const availableWidth = container.clientWidth - 32;
        setScale(Math.max(0.25, Math.min(availableWidth / pageWidth, 3.0)));
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(r => (r + 90) % 360);
    }, []);

    // ── Error state ──
    if (error && !pdfBlob) {
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
                        onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 text-sm font-bold transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── Loading state ──
    if (!pdfBlob) {
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
        <div className="w-full h-full bg-slate-800 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-950 border-b-2 border-slate-600 flex-shrink-0 gap-1">
                {/* Document name + pages */}
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-white font-semibold truncate max-w-[180px]" title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {numPages > 0 && (
                        <span className="text-xs text-white font-semibold whitespace-nowrap">
                            ({numPages} {numPages === 1 ? 'page' : 'pages'})
                        </span>
                    )}
                </div>

                {/* Zoom + Rotate + Search */}
                <div className="flex items-center gap-0.5">
                    <button onClick={handleZoomOut} disabled={scale <= ZOOM_LEVELS[0]} className={btnBase} title="Zoom out">
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-xs text-white font-bold min-w-[40px] text-center tabular-nums px-1">
                        {Math.round(scale * 100)}%
                    </span>
                    <button onClick={handleZoomIn} disabled={scale >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} className={btnBase} title="Zoom in">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToPage} className={btnBase} title="Fit to width">
                        <Maximize size={16} />
                    </button>
                    <button onClick={handleRotate} className={btnBase} title="Rotate 90°">
                        <RotateCw size={16} />
                    </button>
                    <button onClick={toggleSearch} className={searchOpen ? btnActive : btnBase} title="Search (Ctrl+F)">
                        <Search size={16} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                    <button onClick={handlePrint} className={`${btnBase} flex items-center gap-1 px-2`} title="Print">
                        <Printer size={15} />
                        <span className="text-xs font-bold hidden lg:inline">Print</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                        title={`Download ${downloadFileName}.pdf`}
                    >
                        <Download size={14} />
                        <span className="hidden lg:inline">Download</span>
                    </button>
                </div>
            </div>

            {/* Search bar */}
            {searchOpen && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border-b border-slate-700 flex-shrink-0">
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (searchMatches.length > 0) {
                                    handleSearchNav(e.shiftKey ? -1 : 1);
                                } else {
                                    runSearch();
                                }
                            } else if (e.key === 'Escape') {
                                toggleSearch();
                            }
                        }}
                        placeholder="Search in document..."
                        className="flex-1 px-2 py-1 bg-slate-800 text-white text-xs border border-slate-600 outline-none focus:border-blue-500"
                    />
                    <button onClick={runSearch} className={`${btnBase} px-2 text-xs font-bold`}>
                        Search
                    </button>
                    {searchMatches.length > 0 && (
                        <>
                            <span className="text-xs text-white font-semibold whitespace-nowrap tabular-nums">
                                {activeMatchIdx + 1} / {searchMatches.length}
                            </span>
                            <button onClick={() => handleSearchNav(-1)} className={btnBase} title="Previous match">
                                <ChevronUp size={14} />
                            </button>
                            <button onClick={() => handleSearchNav(1)} className={btnBase} title="Next match">
                                <ChevronDown size={14} />
                            </button>
                        </>
                    )}
                    {searchMatches.length === 0 && searchQuery.trim() !== '' && (
                        <span className="text-xs text-red-400 font-semibold">No results</span>
                    )}
                    <button onClick={toggleSearch} className={btnBase} title="Close search">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10 pointer-events-none">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div className="bg-red-900/80 border-b-2 border-red-800 p-2 text-xs text-red-200 text-center flex-shrink-0">
                    <strong>Error:</strong> {error}
                    <button onClick={() => { setError(null); previousDataRef.current = null; }}
                        className="ml-2 underline hover:no-underline text-red-300">Retry</button>
                </div>
            )}

            {/* Scrollable pages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto flex flex-col items-center bg-slate-700/50"
                style={{ padding: '16px' }}
            >
                <div ref={pagesContainerRef} className="flex flex-col items-center" />
            </div>
        </div>
    );
});
