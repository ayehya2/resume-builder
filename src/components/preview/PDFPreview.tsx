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
    RotateCw, Search, X, ChevronUp, ChevronDown,
    Info, PanelLeft
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

/**
 * Manually render a text layer for text selection.
 * Positions transparent text spans on top of the canvas to enable copy/select.
 */
function renderManualTextLayer(
    textContent: any,
    container: HTMLElement,
    viewport: any,
) {
    for (const item of textContent.items as any[]) {
        if (!item.str) continue;

        const span = document.createElement('span');
        span.textContent = item.str;

        // item.transform = [scaleX, skewX, skewY, scaleY, tx, ty]
        const tx = item.transform[4];
        const ty = item.transform[5];
        const [vx, vy] = viewport.convertToViewportPoint(tx, ty);

        const fontHeight = Math.abs(item.transform[3]) * viewport.scale;
        const itemWidth = item.width ? item.width * viewport.scale : item.str.length * fontHeight * 0.55;
        const itemHeight = (item.height || Math.abs(item.transform[3])) * viewport.scale;

        span.style.position = 'absolute';
        span.style.left = `${vx}px`;
        span.style.top = `${vy - itemHeight}px`;
        span.style.fontSize = `${fontHeight}px`;
        span.style.fontFamily = item.fontName?.includes('Bold') ? 'sans-serif' : 'serif';
        span.style.transformOrigin = '0% 0%';
        span.style.color = 'transparent';
        span.style.whiteSpace = 'pre';

        // Scale span width to match the actual rendered width
        if (itemWidth > 0 && item.str.length > 0) {
            // We need to measure and adjust. Use a CSS width trick:
            span.style.letterSpacing = '0px';
            span.style.width = `${itemWidth}px`;
            span.style.display = 'inline-block';
            span.style.overflow = 'hidden';
            // Use scaleX to fit the text
            const estimatedWidth = item.str.length * fontHeight * 0.55;
            if (estimatedWidth > 0) {
                const scaleX = itemWidth / estimatedWidth;
                span.style.transform = `scaleX(${scaleX})`;
            }
        }

        container.appendChild(span);
    }
}

const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
const btnBase = "p-1.5 bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
const btnActive = "p-1.5 bg-blue-600 text-white hover:bg-blue-500 transition-colors";

interface PdfMetadata {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modDate?: string;
    pageCount: number;
    pageSize?: string;
    fileSize?: string;
}

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

    // Thumbnails sidebar
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [thumbnailCanvases, setThumbnailCanvases] = useState<string[]>([]);

    // Properties dialog
    const [showProperties, setShowProperties] = useState(false);
    const [pdfMetadata, setPdfMetadata] = useState<PdfMetadata | null>(null);

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

    // ── Render all pages with text layer ──
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

                const renderScale = 3; // always render at 3x for crisp text

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    if (cancelled) return;

                    const page = await pdfDoc.getPage(i);

                    if (i === 1) {
                        const nv = page.getViewport({ scale: 1, rotation });
                        pageNaturalWidthRef.current = nv.width;
                    }

                    // High-res render viewport (fixed 3x)
                    const renderViewport = page.getViewport({ scale: renderScale, rotation });
                    // CSS viewport at current zoom
                    const cssViewport = page.getViewport({ scale, rotation });
                    const cssW = Math.round(cssViewport.width);
                    const cssH = Math.round(cssViewport.height);

                    // Page wrapper
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.width = `${cssW}px`;
                    wrapper.style.height = `${cssH}px`;
                    wrapper.style.marginBottom = '16px';
                    wrapper.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                    wrapper.dataset.pageNum = String(i);

                    // PDF canvas — rendered at high res, displayed at CSS zoom size
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(renderViewport.width);
                    canvas.height = Math.round(renderViewport.height);
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.display = 'block';
                    canvas.style.backgroundColor = 'white';

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
                    }

                    wrapper.appendChild(canvas);

                    // ── Text layer for text selection ──
                    const textContent = await page.getTextContent();
                    const textLayerDiv = document.createElement('div');
                    textLayerDiv.className = 'pdf-text-layer';

                    // Try pdfjs built-in TextLayer first, fall back to manual
                    let textLayerRendered = false;
                    try {
                        const TextLayerClass = pdfjsLib.TextLayer;
                        if (TextLayerClass) {
                            const tl = new TextLayerClass({
                                textContentSource: textContent,
                                container: textLayerDiv,
                                viewport: cssViewport,
                            });
                            await tl.render();
                            textLayerRendered = true;
                        }
                    } catch {
                        // TextLayer class not available or failed
                    }

                    if (!textLayerRendered) {
                        renderManualTextLayer(textContent, textLayerDiv, cssViewport);
                    }

                    wrapper.appendChild(textLayerDiv);

                    if (cancelled) return;
                    container.appendChild(wrapper);
                    page.cleanup();
                }

                // ── Generate thumbnails ──
                if (!cancelled) {
                    generateThumbnails(pdfDoc, pdfDoc.numPages);
                }

                // ── Fetch metadata ──
                if (!cancelled) {
                    fetchMetadata(pdfDoc);
                }
            } catch (err) {
                if (!cancelled) console.error('[PDFPreview] Render failed:', err);
            }
        };

        renderAllPages();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfBlob, scale, rotation]);

    // ── Generate page thumbnails ──
    const generateThumbnails = useCallback(async (pdfDoc: any, numPages: number) => {
        const thumbs: string[] = [];
        const thumbScale = 0.3;

        for (let i = 1; i <= numPages; i++) {
            try {
                const page = await pdfDoc.getPage(i);
                const vp = page.getViewport({ scale: thumbScale, rotation });
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(vp.width);
                canvas.height = Math.round(vp.height);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    await page.render({ canvasContext: ctx, viewport: vp }).promise;
                }
                thumbs.push(canvas.toDataURL('image/png'));
                page.cleanup();
            } catch {
                thumbs.push('');
            }
        }

        setThumbnailCanvases(thumbs);
    }, [rotation]);

    // ── Fetch PDF metadata ──
    const fetchMetadata = useCallback(async (pdfDoc: any) => {
        try {
            const metadata = await pdfDoc.getMetadata();
            const page1 = await pdfDoc.getPage(1);
            const vp = page1.getViewport({ scale: 1, rotation: 0 });

            // Convert PDF points to inches (72 points = 1 inch)
            const widthIn = (vp.width / 72).toFixed(2);
            const heightIn = (vp.height / 72).toFixed(2);

            const info = metadata?.info || {};
            setPdfMetadata({
                title: info.Title || undefined,
                author: info.Author || undefined,
                subject: info.Subject || undefined,
                creator: info.Creator || undefined,
                producer: info.Producer || undefined,
                creationDate: info.CreationDate || undefined,
                modDate: info.ModDate || undefined,
                pageCount: pdfDoc.numPages,
                pageSize: `${widthIn}" × ${heightIn}" (${Math.round(vp.width)}×${Math.round(vp.height)} pt)`,
                fileSize: pdfBlob ? formatFileSize(pdfBlob.size) : undefined,
            });
            page1.cleanup();
        } catch {
            setPdfMetadata({
                pageCount: pdfDoc.numPages,
                fileSize: pdfBlob ? formatFileSize(pdfBlob.size) : undefined,
            });
        }
    }, [pdfBlob]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (pdfDocRef.current) {
                pdfDocRef.current.destroy();
                pdfDocRef.current = null;
            }
        };
    }, []);

    // ── Intercept Ctrl+Zoom and Ctrl+F on preview ──
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isInsidePreview = () => {
            const root = rootRef.current;
            if (!root) return false;
            return root.matches(':hover');
        };

        // Ctrl+Scroll → zoom PDF instead of browser
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            const root = rootRef.current;
            if (!root || !root.contains(e.target as Node)) return;

            e.preventDefault();
            if (e.deltaY < 0) {
                setScale(s => Math.min(s + 0.1, 3.0));
            } else {
                setScale(s => Math.max(s - 0.1, 0.25));
            }
        };

        // Ctrl+Plus / Ctrl+Minus / Ctrl+0 / Ctrl+F
        const onKeyDown = (e: KeyboardEvent) => {
            if (!e.ctrlKey) return;
            if (!isInsidePreview()) return;

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                setScale(s => Math.min(s + 0.1, 3.0));
            } else if (e.key === '-') {
                e.preventDefault();
                setScale(s => Math.max(s - 0.1, 0.25));
            } else if (e.key === '0') {
                e.preventDefault();
                setScale(1.0);
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                toggleSearch();
            }
        };

        document.addEventListener('wheel', onWheel, { passive: false });
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('wheel', onWheel);
            document.removeEventListener('keydown', onKeyDown);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                const [vx, vy] = cssViewport.convertToViewportPoint(tx, ty);
                const itemHeight = (item.height || Math.abs(item.transform[3])) * scale;
                const itemWidth = (item.width || text.length * Math.abs(item.transform[3]) * 0.6) * scale;

                let searchStart = 0;
                while (true) {
                    const idx = textLower.indexOf(query, searchStart);
                    if (idx === -1) break;

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

                    searchStart = idx + 1;
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

    // ── Scroll to a specific page (used by thumbnail click) ──
    const scrollToPage = useCallback((pageNum: number) => {
        const container = pagesContainerRef.current;
        if (!container) return;
        const wrapper = container.querySelector(`[data-page-num="${pageNum}"]`) as HTMLElement;
        if (wrapper) {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // ── Actions ──
    const handleDownload = useCallback(async () => {
        if (!pdfBlob) return;

        if (rotation === 0) {
            // No rotation — download original PDF (text-selectable)
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${downloadFileName}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Rotation applied — re-render pages with rotation into a new PDF via jsPDF
            try {
                const { default: jsPDF } = await import('jspdf');
                const pdfjsLib = await getPdfjsLib();
                const arrayBuffer = await pdfBlob.arrayBuffer();
                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let doc: any = null;

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const vp = page.getViewport({ scale: 2, rotation });
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(vp.width);
                    canvas.height = Math.round(vp.height);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        await page.render({ canvasContext: ctx, viewport: vp }).promise;
                    }

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdfW = vp.width * 0.375; // 72 DPI conversion at scale 2
                    const pdfH = vp.height * 0.375;

                    if (i === 1) {
                        doc = new jsPDF({
                            orientation: pdfW > pdfH ? 'landscape' : 'portrait',
                            unit: 'pt',
                            format: [pdfW, pdfH],
                        });
                    } else {
                        doc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
                    }

                    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                    page.cleanup();
                }

                if (doc) {
                    doc.save(`${downloadFileName}.pdf`);
                }
                pdfDoc.destroy();
            } catch (err) {
                console.error('Rotated download failed, falling back to original:', err);
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${downloadFileName}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }
    }, [pdfBlob, downloadFileName, rotation]);

    const handlePrint = useCallback(async () => {
        if (!pdfBlob) return;

        if (rotation === 0) {
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        } else {
            // Rotation applied — create rotated blob and print it
            try {
                const { default: jsPDF } = await import('jspdf');
                const pdfjsLib = await getPdfjsLib();
                const arrayBuffer = await pdfBlob.arrayBuffer();
                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let doc: any = null;

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const vp = page.getViewport({ scale: 2, rotation });
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(vp.width);
                    canvas.height = Math.round(vp.height);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        await page.render({ canvasContext: ctx, viewport: vp }).promise;
                    }

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdfW = vp.width * 0.375;
                    const pdfH = vp.height * 0.375;

                    if (i === 1) {
                        doc = new jsPDF({
                            orientation: pdfW > pdfH ? 'landscape' : 'portrait',
                            unit: 'pt',
                            format: [pdfW, pdfH],
                        });
                    } else {
                        doc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
                    }

                    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                    page.cleanup();
                }

                if (doc) {
                    const rotatedBlob = doc.output('blob');
                    const url = URL.createObjectURL(rotatedBlob);
                    window.open(url, '_blank');
                }
                pdfDoc.destroy();
            } catch {
                // Fallback: open original
                const url = URL.createObjectURL(pdfBlob);
                window.open(url, '_blank');
            }
        }
    }, [pdfBlob, rotation]);

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
        const availableWidth = container.clientWidth - 32 - (showThumbnails ? 140 : 0);
        setScale(Math.max(0.25, Math.min(availableWidth / pageWidth, 3.0)));
    }, [showThumbnails]);

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
        <div ref={rootRef} className="w-full h-full bg-slate-800 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-950 border-b-2 border-slate-600 flex-shrink-0 gap-1">
                {/* Left: Thumbnails toggle + Document name */}
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => setShowThumbnails(v => !v)}
                        className={showThumbnails ? btnActive : btnBase}
                        title="Page thumbnails"
                    >
                        <PanelLeft size={16} />
                    </button>
                    <span className="text-xs text-white font-semibold truncate max-w-[140px]" title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {numPages > 0 && (
                        <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                            {numPages}p
                        </span>
                    )}
                </div>

                {/* Center: Zoom + Rotate + Search + Properties */}
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
                    <div className="w-px h-5 bg-slate-600 mx-0.5" />
                    <button onClick={handleRotate} className={rotation !== 0 ? btnActive : btnBase} title={`Rotate 90° (current: ${rotation}°)`}>
                        <RotateCw size={16} />
                    </button>
                    <button onClick={toggleSearch} className={searchOpen ? btnActive : btnBase} title="Search (Ctrl+F)">
                        <Search size={16} />
                    </button>
                    <button onClick={() => setShowProperties(v => !v)} className={showProperties ? btnActive : btnBase} title="Document properties">
                        <Info size={16} />
                    </button>
                </div>

                {/* Right: Actions */}
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

            {/* Properties panel */}
            {showProperties && pdfMetadata && (
                <div className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Document Properties</h4>
                        <button onClick={() => setShowProperties(false)} className={btnBase} title="Close">
                            <X size={12} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                        {pdfMetadata.title && <PropRow label="Title" value={pdfMetadata.title} />}
                        {pdfMetadata.author && <PropRow label="Author" value={pdfMetadata.author} />}
                        {pdfMetadata.subject && <PropRow label="Subject" value={pdfMetadata.subject} />}
                        {pdfMetadata.creator && <PropRow label="Creator" value={pdfMetadata.creator} />}
                        {pdfMetadata.producer && <PropRow label="Producer" value={pdfMetadata.producer} />}
                        <PropRow label="Pages" value={String(pdfMetadata.pageCount)} />
                        {pdfMetadata.pageSize && <PropRow label="Page Size" value={pdfMetadata.pageSize} />}
                        {pdfMetadata.fileSize && <PropRow label="File Size" value={pdfMetadata.fileSize} />}
                        {rotation !== 0 && <PropRow label="Rotation" value={`${rotation}°`} />}
                    </div>
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

            {/* Main content area: optional thumbnails sidebar + scrollable pages */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails sidebar */}
                {showThumbnails && (
                    <div className="w-[130px] flex-shrink-0 bg-slate-900 border-r border-slate-700 overflow-y-auto p-2 space-y-2">
                        {thumbnailCanvases.map((src, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToPage(idx + 1)}
                                className="w-full group relative"
                                title={`Page ${idx + 1}`}
                            >
                                {src ? (
                                    <img
                                        src={src}
                                        alt={`Page ${idx + 1}`}
                                        className="w-full border-2 border-slate-600 group-hover:border-blue-500 transition-colors bg-white"
                                    />
                                ) : (
                                    <div className="w-full aspect-[3/4] border-2 border-slate-600 bg-slate-800 flex items-center justify-center">
                                        <span className="text-xs text-slate-500">{idx + 1}</span>
                                    </div>
                                )}
                                <span className="block text-center text-[10px] text-slate-400 font-bold mt-1">
                                    {idx + 1}
                                </span>
                            </button>
                        ))}
                        {thumbnailCanvases.length === 0 && numPages > 0 && (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        )}
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
        </div>
    );
});

// ── Helper components ──

function PropRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <span className="text-slate-500 font-semibold">{label}:</span>
            <span className="text-slate-300 truncate" title={value}>{value}</span>
        </>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
