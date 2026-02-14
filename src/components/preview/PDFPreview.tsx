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

// ── Detect dark mode from the <html> class (set by App.tsx) ──
function useIsDarkMode() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return dark;
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
    const darkMode = useIsDarkMode();

    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState<number | null>(null); // null = not yet initialized (will auto-fit)
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
    const printIframeRef = useRef<HTMLIFrameElement | null>(null);
    const hasFittedRef = useRef(false);

    // Effective scale (null = 1.0 until first fit)
    const effectiveScale = scale ?? 1.0;

    // Theme-aware button styles
    const btnBase = darkMode
        ? "p-1.5 bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        : "p-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
    const btnActive = "p-1.5 bg-blue-600 text-white hover:bg-blue-500 transition-colors";

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

    // ── Auto-fit to width on first render ──
    useEffect(() => {
        if (!pdfBlob || hasFittedRef.current) return;
        // Wait a tick for the container to be measured
        const timer = setTimeout(() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const pageWidth = pageNaturalWidthRef.current;
            if (pageWidth > 0) {
                const availableWidth = container.clientWidth - 32;
                const fitScale = Math.max(0.25, Math.min(availableWidth / pageWidth, 3.0));
                setScale(fitScale);
                hasFittedRef.current = true;
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [pdfBlob, numPages]);

    // ── Render all pages with text layer + annotation layer (links) ──
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

                clearHighlights();

                const container = pagesContainerRef.current;
                if (!container) return;
                container.innerHTML = '';

                const renderScale = 3;

                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    if (cancelled) return;

                    const page = await pdfDoc.getPage(i);

                    if (i === 1) {
                        const nv = page.getViewport({ scale: 1, rotation });
                        pageNaturalWidthRef.current = nv.width;
                    }

                    const renderViewport = page.getViewport({ scale: renderScale, rotation });
                    const cssViewport = page.getViewport({ scale: effectiveScale, rotation });
                    const cssW = Math.round(cssViewport.width);
                    const cssH = Math.round(cssViewport.height);

                    // Page wrapper
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.width = `${cssW}px`;
                    wrapper.style.height = `${cssH}px`;
                    wrapper.style.marginBottom = '16px';
                    wrapper.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
                    wrapper.dataset.pageNum = String(i);

                    // Canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(renderViewport.width);
                    canvas.height = Math.round(renderViewport.height);
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.display = 'block';
                    canvas.style.backgroundColor = 'white';
                    canvas.style.pointerEvents = 'none'; // let text/link layers receive events

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;
                    }

                    wrapper.appendChild(canvas);

                    // ── Text layer (pdfjs built-in) ──
                    try {
                        const TextLayerClass = pdfjsLib.TextLayer;
                        if (TextLayerClass) {
                            const textContent = await page.getTextContent();
                            const textLayerDiv = document.createElement('div');
                            textLayerDiv.className = 'pdf-text-layer';
                            const tl = new TextLayerClass({
                                textContentSource: textContent,
                                container: textLayerDiv,
                                viewport: cssViewport,
                            });
                            await tl.render();
                            wrapper.appendChild(textLayerDiv);
                        }
                    } catch (err) {
                        console.warn('[PDFPreview] TextLayer failed:', err);
                    }

                    // ── Annotation layer (clickable links) ──
                    try {
                        const annotations = await page.getAnnotations({ intent: 'display' });
                        if (annotations.length > 0) {
                            const linkLayerDiv = document.createElement('div');
                            linkLayerDiv.className = 'pdf-link-layer';

                            for (const annot of annotations) {
                                if (annot.subtype !== 'Link' || !annot.rect) continue;

                                const rect = annot.rect;
                                // Convert PDF rect to viewport coords
                                const [x1, y1] = cssViewport.convertToViewportPoint(rect[0], rect[1]);
                                const [x2, y2] = cssViewport.convertToViewportPoint(rect[2], rect[3]);

                                const left = Math.min(x1, x2);
                                const top = Math.min(y1, y2);
                                const width = Math.abs(x2 - x1);
                                const height = Math.abs(y2 - y1);

                                const a = document.createElement('a');
                                if (annot.url) {
                                    a.href = annot.url;
                                    a.target = '_blank';
                                    a.rel = 'noopener noreferrer';
                                } else if (annot.dest) {
                                    a.href = '#';
                                    const destPage = annot.dest;
                                    a.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        // Try to navigate to dest page
                                        if (Array.isArray(destPage) && destPage.length > 0) {
                                            const pageWrapper = container.querySelector(`[data-page-num="${1}"]`);
                                            pageWrapper?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    });
                                }

                                a.style.position = 'absolute';
                                a.style.left = `${left}px`;
                                a.style.top = `${top}px`;
                                a.style.width = `${width}px`;
                                a.style.height = `${height}px`;
                                a.style.cursor = 'pointer';
                                a.title = annot.url || '';

                                linkLayerDiv.appendChild(a);
                            }

                            wrapper.appendChild(linkLayerDiv);
                        }
                    } catch (err) {
                        console.warn('[PDFPreview] AnnotationLayer failed:', err);
                    }

                    if (cancelled) return;
                    container.appendChild(wrapper);
                    page.cleanup();
                }

                // Generate thumbnails & fetch metadata
                if (!cancelled) {
                    generateThumbnails(pdfDoc, pdfDoc.numPages);
                    fetchMetadata(pdfDoc);
                }
            } catch (err) {
                if (!cancelled) console.error('[PDFPreview] Render failed:', err);
            }
        };

        renderAllPages();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfBlob, effectiveScale, rotation]);

    // ── Generate page thumbnails ──
    const generateThumbnails = useCallback(async (pdfDoc: any, pageCount: number) => {
        const thumbs: string[] = [];
        const thumbScale = 0.3;

        for (let i = 1; i <= pageCount; i++) {
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

    // ── Intercept Ctrl+Zoom and Ctrl+F ──
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isInsidePreview = () => {
            const root = rootRef.current;
            if (!root) return false;
            return root.matches(':hover');
        };

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            const root = rootRef.current;
            if (!root || !root.contains(e.target as Node)) return;

            e.preventDefault();
            if (e.deltaY < 0) {
                setScale(s => Math.min((s ?? 1.0) + 0.1, 3.0));
            } else {
                setScale(s => Math.max((s ?? 1.0) - 0.1, 0.25));
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (!e.ctrlKey) return;
            if (!isInsidePreview()) return;

            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                setScale(s => Math.min((s ?? 1.0) + 0.1, 3.0));
            } else if (e.key === '-') {
                e.preventDefault();
                setScale(s => Math.max((s ?? 1.0) - 0.1, 0.25));
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
            const cssViewport = page.getViewport({ scale: effectiveScale, rotation });
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
                const itemHeight = (item.height || Math.abs(item.transform[3])) * effectiveScale;
                const itemWidth = (item.width || text.length * Math.abs(item.transform[3]) * 0.6) * effectiveScale;

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
                    hl.style.zIndex = '10';
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
    }, [searchQuery, effectiveScale, rotation, clearHighlights]);

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

    const scrollToPage = useCallback((pageNum: number) => {
        const container = pagesContainerRef.current;
        if (!container) return;
        const wrapper = container.querySelector(`[data-page-num="${pageNum}"]`) as HTMLElement;
        if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    // ── Actions ──
    const handleDownload = useCallback(async () => {
        if (!pdfBlob) return;

        if (rotation === 0) {
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${downloadFileName}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
        } else {
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
                    if (ctx) await page.render({ canvasContext: ctx, viewport: vp }).promise;

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdfW = vp.width * 0.375;
                    const pdfH = vp.height * 0.375;

                    if (i === 1) {
                        doc = new jsPDF({ orientation: pdfW > pdfH ? 'landscape' : 'portrait', unit: 'pt', format: [pdfW, pdfH] });
                    } else {
                        doc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
                    }
                    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                    page.cleanup();
                }
                if (doc) doc.save(`${downloadFileName}.pdf`);
                pdfDoc.destroy();
            } catch (err) {
                console.error('Rotated download fallback:', err);
                const url = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${downloadFileName}.pdf`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }
    }, [pdfBlob, downloadFileName, rotation]);

    // ── Print via hidden iframe (no new tab) ──
    const handlePrint = useCallback(async () => {
        if (!pdfBlob) return;

        let blobToUse = pdfBlob;

        // If rotated, build a rotated PDF first
        if (rotation !== 0) {
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
                    if (ctx) await page.render({ canvasContext: ctx, viewport: vp }).promise;
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdfW = vp.width * 0.375;
                    const pdfH = vp.height * 0.375;
                    if (i === 1) {
                        doc = new jsPDF({ orientation: pdfW > pdfH ? 'landscape' : 'portrait', unit: 'pt', format: [pdfW, pdfH] });
                    } else {
                        doc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
                    }
                    doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                    page.cleanup();
                }
                if (doc) blobToUse = doc.output('blob');
                pdfDoc.destroy();
            } catch {
                // Use original blob
            }
        }

        const url = URL.createObjectURL(blobToUse);

        // Reuse or create hidden iframe for printing
        if (printIframeRef.current) {
            document.body.removeChild(printIframeRef.current);
        }
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        printIframeRef.current = iframe;

        iframe.onload = () => {
            setTimeout(() => {
                try {
                    iframe.contentWindow?.print();
                } catch {
                    // Fallback: open in new tab
                    window.open(url, '_blank');
                }
            }, 300);
        };
        iframe.src = url;
    }, [pdfBlob, rotation]);

    const handleZoomIn = useCallback(() => {
        setScale(s => {
            const cur = s ?? 1.0;
            const next = ZOOM_LEVELS.find(z => z > cur + 0.01);
            return next ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(s => {
            const cur = s ?? 1.0;
            const prev = [...ZOOM_LEVELS].reverse().find(z => z < cur - 0.01);
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

    // ── Theme classes ──
    const toolbarBg = darkMode ? 'bg-slate-950 border-slate-600' : 'bg-slate-100 border-slate-300';
    const sidebarBg = darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300';
    const bodyBg = darkMode ? 'bg-slate-800' : 'bg-slate-200';
    const scrollBg = darkMode ? 'bg-slate-700/50' : 'bg-slate-300/50';
    const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
    const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-500';

    // ── Error state ──
    if (error && !pdfBlob) {
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
                        className={btnBase + " px-4 py-2 text-sm font-bold"}
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
            <div className={`w-full h-full ${bodyBg} flex items-center justify-center`}>
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className={`text-sm font-semibold ${textSecondary}`}>
                        {isLatexTemplate(templateId) ? 'Compiling with pdfTeX...' : 'Generating preview...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className={`w-full h-full ${bodyBg} flex flex-col`}>
            {/* Toolbar */}
            <div className={`flex items-center justify-between px-2 py-1.5 border-b-2 flex-shrink-0 gap-1 ${toolbarBg}`}>
                {/* Left: Thumbnails toggle + Document name */}
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        onClick={() => setShowThumbnails(v => !v)}
                        className={showThumbnails ? btnActive : btnBase}
                        title="Page thumbnails"
                    >
                        <PanelLeft size={16} />
                    </button>
                    <span className={`text-xs font-semibold truncate max-w-[140px] ${textPrimary}`} title={`${downloadFileName}.pdf`}>
                        {downloadFileName}.pdf
                    </span>
                    {numPages > 0 && (
                        <span className={`text-xs font-semibold whitespace-nowrap ${textSecondary}`}>
                            {numPages}p
                        </span>
                    )}
                </div>

                {/* Center: Controls */}
                <div className="flex items-center gap-0.5">
                    <button onClick={handleZoomOut} disabled={effectiveScale <= ZOOM_LEVELS[0]} className={btnBase} title="Zoom out">
                        <ZoomOut size={16} />
                    </button>
                    <span className={`text-xs font-bold min-w-[40px] text-center tabular-nums px-1 ${textPrimary}`}>
                        {Math.round(effectiveScale * 100)}%
                    </span>
                    <button onClick={handleZoomIn} disabled={effectiveScale >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]} className={btnBase} title="Zoom in">
                        <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToPage} className={btnBase} title="Fit to width">
                        <Maximize size={16} />
                    </button>
                    <div className={`w-px h-5 mx-0.5 ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
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
                <div className={`flex items-center gap-2 px-3 py-1.5 border-b flex-shrink-0 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (searchMatches.length > 0) handleSearchNav(e.shiftKey ? -1 : 1);
                                else runSearch();
                            } else if (e.key === 'Escape') {
                                toggleSearch();
                            }
                        }}
                        placeholder="Search in document..."
                        className={`flex-1 px-2 py-1 text-xs border outline-none ${darkMode
                            ? 'bg-slate-800 text-white border-slate-600 focus:border-blue-500'
                            : 'bg-white text-slate-900 border-slate-300 focus:border-blue-500'
                        }`}
                    />
                    <button onClick={runSearch} className={`${btnBase} px-2 text-xs font-bold`}>Search</button>
                    {searchMatches.length > 0 && (
                        <>
                            <span className={`text-xs font-semibold whitespace-nowrap tabular-nums ${textPrimary}`}>
                                {activeMatchIdx + 1} / {searchMatches.length}
                            </span>
                            <button onClick={() => handleSearchNav(-1)} className={btnBase} title="Previous"><ChevronUp size={14} /></button>
                            <button onClick={() => handleSearchNav(1)} className={btnBase} title="Next"><ChevronDown size={14} /></button>
                        </>
                    )}
                    {searchMatches.length === 0 && searchQuery.trim() !== '' && (
                        <span className="text-xs text-red-500 font-semibold">No results</span>
                    )}
                    <button onClick={toggleSearch} className={btnBase} title="Close search"><X size={14} /></button>
                </div>
            )}

            {/* Properties floating dialog (Chrome-style centered overlay) */}
            {showProperties && pdfMetadata && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto" onClick={() => setShowProperties(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
                    <div className={`pointer-events-auto relative z-40 w-[360px] max-w-[90%] border-2 shadow-2xl ${darkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'}`}>
                        <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Document Properties</h4>
                            <button onClick={() => setShowProperties(false)} className={btnBase} title="Close"><X size={14} /></button>
                        </div>
                        <div className="px-4 py-3 space-y-2.5">
                            <PropRow label="File Name" value={`${downloadFileName}.pdf`} dark={darkMode} />
                            {pdfMetadata.title && <PropRow label="Title" value={pdfMetadata.title} dark={darkMode} />}
                            {pdfMetadata.author && <PropRow label="Author" value={pdfMetadata.author} dark={darkMode} />}
                            {pdfMetadata.subject && <PropRow label="Subject" value={pdfMetadata.subject} dark={darkMode} />}
                            {pdfMetadata.creator && <PropRow label="Creator" value={pdfMetadata.creator} dark={darkMode} />}
                            {pdfMetadata.producer && <PropRow label="Producer" value={pdfMetadata.producer} dark={darkMode} />}
                            <div className={`border-t pt-2.5 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                <PropRow label="Pages" value={String(pdfMetadata.pageCount)} dark={darkMode} />
                            </div>
                            {pdfMetadata.pageSize && <PropRow label="Page Size" value={pdfMetadata.pageSize} dark={darkMode} />}
                            {pdfMetadata.fileSize && <PropRow label="File Size" value={pdfMetadata.fileSize} dark={darkMode} />}
                            {rotation !== 0 && <PropRow label="Rotation" value={`${rotation}°`} dark={darkMode} />}
                        </div>
                    </div>
                </div>
            )}

            {/* Generating overlay */}
            {isGenerating && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
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

            {/* Main content: thumbnails sidebar + pages */}
            <div className="flex-1 flex overflow-hidden">
                {/* Thumbnails sidebar */}
                {showThumbnails && (
                    <div className={`w-[130px] flex-shrink-0 border-r overflow-y-auto p-2 space-y-2 ${sidebarBg}`}>
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
                                        className={`w-full border-2 group-hover:border-blue-500 transition-colors bg-white ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}
                                    />
                                ) : (
                                    <div className={`w-full aspect-[3/4] border-2 flex items-center justify-center ${darkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-slate-100'}`}>
                                        <span className={`text-xs ${textSecondary}`}>{idx + 1}</span>
                                    </div>
                                )}
                                <span className={`block text-center text-[10px] font-bold mt-1 ${textSecondary}`}>
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
                    className={`flex-1 overflow-auto flex flex-col items-center ${scrollBg}`}
                    style={{ padding: '16px' }}
                >
                    <div ref={pagesContainerRef} className="flex flex-col items-center" />
                </div>
            </div>
        </div>
    );
});

// ── Helper components ──

function PropRow({ label, value, dark }: { label: string; value: string; dark: boolean }) {
    return (
        <div className="flex items-start gap-3">
            <span className={`text-xs font-semibold w-[90px] flex-shrink-0 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
            <span className={`text-xs font-medium break-all ${dark ? 'text-slate-200' : 'text-slate-700'}`} title={value}>{value}</span>
        </div>
    );
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
