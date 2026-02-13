import { pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

/**
 * Render a @react-pdf/renderer Document to a PNG data-URL using pdfjs-dist.
 *
 * Flow:
 *   1. pdf(<Component>).toBlob()  →  PDF Blob
 *   2. pdfjs-dist  getDocument()  →  PDF page
 *   3. page.render() to <canvas>  →  dataURL
 *
 * Returns `null` on any failure so the caller can show a fallback.
 */
export async function pdfToImage(
    component: ReactElement,
    scale = 2.0
): Promise<string | null> {
    try {
        // 1. Render @react-pdf Document to a Blob
        const blob = await pdf(component as any).toBlob();
        const arrayBuffer = await blob.arrayBuffer();

        // 2. Load pdfjs-dist dynamically (same pattern as resumeParser.ts)
        let pdfjsLib: any;
        try {
            pdfjsLib = await import('pdfjs-dist');
        } catch {
            console.error('[pdfToImage] Failed to import pdfjs-dist');
            return null;
        }

        // Set up worker
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

        // 3. Open the document and render page 1
        let pdfDoc: any;
        try {
            pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        } catch {
            // Retry without worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = '';
            pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        }

        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale });

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');

        // Cleanup
        page.cleanup();
        pdfDoc.destroy();

        return dataUrl;
    } catch (err) {
        console.error('[pdfToImage] Failed to render PDF thumbnail:', err);
        return null;
    }
}
