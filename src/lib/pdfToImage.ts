import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Internal: Set up pdfjs-dist and return the library.
 */
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
 * Internal: Render a PDF ArrayBuffer to a PNG data-URL.
 */
async function renderPdfPageToImage(arrayBuffer: ArrayBuffer, scale: number): Promise<string | null> {
    const pdfjsLib = await getPdfjsLib();

    let pdfDoc: any;
    try {
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    }

    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png');

    page.cleanup();
    pdfDoc.destroy();

    return dataUrl;
}

/**
 * Render a @react-pdf/renderer Document to a PNG data-URL.
 * Returns `null` on any failure so the caller can show a fallback.
 */
export async function pdfToImage(
    component: ReactElement,
    scale = 2.0
): Promise<string | null> {
    try {
        const blob = await pdf(component as any).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        return await renderPdfPageToImage(arrayBuffer, scale);
    } catch (err) {
        console.error('[pdfToImage] Failed to render PDF thumbnail:', err);
        return null;
    }
}

/**
 * Render a PDF Blob (e.g. from LaTeX API) to a PNG data-URL.
 * Returns `null` on any failure.
 */
export async function blobToImage(
    blob: Blob,
    scale = 2.0
): Promise<string | null> {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        return await renderPdfPageToImage(arrayBuffer, scale);
    } catch (err) {
        console.error('[blobToImage] Failed to render PDF blob thumbnail:', err);
        return null;
    }
}
