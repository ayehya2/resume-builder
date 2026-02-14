/**
 * LaTeX API Compiler
 *
 * Compiles LaTeX source to PDF using the latex-on-http API
 * (https://github.com/YtoTech/latex-on-http).
 *
 * This produces REAL pdfTeX output — identical to running pdflatex locally.
 * Requests are proxied through Vite dev server to avoid CORS issues.
 */

const API_URL = '/api/latex';

interface CompileOptions {
    compiler?: 'pdflatex' | 'xelatex' | 'lualatex';
    timeout?: number;
}

/**
 * Compile LaTeX source to PDF via the API.
 * Returns a Blob containing the compiled PDF.
 */
export async function compileLatexViaApi(
    texSource: string,
    options: CompileOptions = {}
): Promise<Blob> {
    const { compiler = 'pdflatex', timeout = 30000 } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler,
                resources: [
                    {
                        main: true,
                        content: texSource,
                    },
                ],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Try to get error details from response
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(
                    `LaTeX compilation failed: ${errorData.error || errorData.message || response.statusText}`
                );
            }
            const text = await response.text();
            throw new Error(`LaTeX compilation failed (${response.status}): ${text.slice(0, 500)}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
            throw new Error('LaTeX compilation returned empty PDF');
        }

        return blob;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('LaTeX compilation timed out (30s). Try simplifying your document.');
            }
            throw error;
        }
        throw new Error('LaTeX compilation failed unexpectedly');
    }
}

/**
 * Check if the LaTeX API is reachable.
 */
export async function isLatexApiAvailable(): Promise<boolean> {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compiler: 'pdflatex',
                resources: [{ main: true, content: '\\documentclass{article}\\begin{document}test\\end{document}' }],
            }),
            signal: AbortSignal.timeout(10000),
        });
        return response.ok;
    } catch {
        return false;
    }
}
