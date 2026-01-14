/**
 * Preview Manager for Resume Builder
 * Handles PDF generation, rendering, and caching
 */

const PreviewManager = {
    previewUpdateTimeout: null,
    currentPreviewRequest: null,
    lastResumeDataHash: null,
    lastPDFBlob: null,
    lastRequestSignature: null,
    pendingRequest: null,

    init: function () {
        console.log('📡 Preview Manager Initializing...');
        // Initial preview update
        setTimeout(() => {
            this.debouncedUpdatePreview();
        }, 500);
    },

    /**
     * Throttled preview update
     */
    throttledPreviewUpdate: function () {
        this.debouncedUpdatePreview();
    },

    /**
     * Smart preview update with request deduplication
     */
    debouncedUpdatePreview: function () {
        const resumeData = window.DataManager.collectResumeData();
        if (!resumeData) return;

        const requestSignature = this.hashObject(resumeData);

        // If this exact request is already pending or last completed, skip
        if (requestSignature === this.lastRequestSignature ||
            (this.pendingRequest && this.pendingRequest.signature === requestSignature)) {
            console.log('🔄 Skipping duplicate preview request');
            return;
        }

        // Clear pending timeout
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }

        // Cancel pending request
        if (this.pendingRequest && this.pendingRequest.controller) {
            this.pendingRequest.controller.abort();
            this.pendingRequest = null;
        }

        this.pendingRequest = {
            signature: requestSignature,
            timestamp: Date.now(),
            controller: null
        };

        this.previewUpdateTimeout = setTimeout(() => {
            if (this.pendingRequest && this.pendingRequest.signature === requestSignature) {
                this.processPreviewUpdate(requestSignature);
            }
        }, 500);
    },

    processPreviewUpdate: async function (signature) {
        const updateBtn = document.getElementById('updatePreviewBtn');
        try {
            this.lastRequestSignature = signature;
            const controller = new AbortController();
            if (this.pendingRequest) this.pendingRequest.controller = controller;

            if (updateBtn) {
                updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>GENERATING...';
                updateBtn.disabled = true;
            }

            await this.updatePreview(controller, signature);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Preview error:', error);
                this.lastRequestSignature = null;
                const container = document.getElementById('previewContainer');
                if (container) container.innerHTML = `<div class="p-4 text-center text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i><br>
                    Generation Failed: ${error.message}
                </div>`;
            }
        } finally {
            if (this.pendingRequest && this.pendingRequest.signature === signature) {
                this.pendingRequest = null;
            }
            if (updateBtn) {
                updateBtn.innerHTML = '<i class="fas fa-sync me-2"></i>UPDATE PREVIEW';
                updateBtn.disabled = false;
            }
        }
    },

    updatePreview: async function (controller, signature) {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        const resumeData = window.DataManager.collectResumeData();
        if (!resumeData) return;

        const currentHash = this.hashObject(resumeData);
        if (this.lastResumeDataHash === currentHash && this.lastPDFBlob) {
            await this.renderPDFWithCustomViewer(this.lastPDFBlob, previewContainer);
            return;
        }

        const response = await fetch('/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formData: resumeData, format: 'pdf' }),
            signal: controller.signal
        });

        if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || 'Server error during PDF generation');
        }

        const pdfBlob = await response.blob();
        this.lastPDFBlob = pdfBlob;
        this.lastResumeDataHash = currentHash;

        await this.renderPDFWithCustomViewer(pdfBlob, previewContainer);
    },

    renderPDFWithCustomViewer: async function (pdfBlob, container) {
        try {
            console.log('📄 Rendering PDF...');
            if (!window.pdfjsLib) {
                throw new Error('PDF.js library not loaded');
            }

            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            const pdfData = await pdfBlob.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: pdfData });
            const pdf = await loadingTask.promise;

            let currentPage = 1;
            let scale = 1.2;
            let isRendering = false;

            container.innerHTML = `
                <div class="pdf-viewer-container">
                    <div class="pdf-toolbar">
                        <div class="pdf-controls">
                            <button class="pdf-btn" id="prevPage"><i class="fas fa-chevron-left"></i></button>
                            <span class="pdf-page-info">Page <span id="currentPageNum">1</span> of ${pdf.numPages}</span>
                            <button class="pdf-btn" id="nextPage"><i class="fas fa-chevron-right"></i></button>
                        </div>
                        <div class="pdf-controls">
                            <button class="pdf-btn" id="zoomOut" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                            <button class="pdf-btn" id="zoomIn" title="Zoom Plus"><i class="fas fa-search-plus"></i></button>
                            <button class="pdf-btn" id="downloadTex" title="Download LaTeX Source" style="background: #34495e !important;"><i class="fas fa-code me-1"></i>TeX</button>
                            <button class="pdf-btn" id="downloadPdf" title="Download PDF" style="background: #e74c3c !important;"><i class="fas fa-file-pdf me-1"></i>PDF</button>
                        </div>
                    </div>
                    <div class="pdf-canvas-container">
                        <canvas id="pdfCanvas" class="pdf-canvas"></canvas>
                    </div>
                </div>`;

            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            const pageNumSpan = document.getElementById('currentPageNum');

            const renderPage = async (num) => {
                if (isRendering) return;
                isRendering = true;
                try {
                    const page = await pdf.getPage(num);
                    const viewport = page.getViewport({ scale });
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    pageNumSpan.textContent = num;
                } finally {
                    isRendering = false;
                }
            };

            document.getElementById('prevPage').addEventListener('click', () => {
                if (currentPage > 1) renderPage(--currentPage);
            });
            document.getElementById('nextPage').addEventListener('click', () => {
                if (currentPage < pdf.numPages) renderPage(++currentPage);
            });
            document.getElementById('zoomOut').addEventListener('click', () => {
                scale = Math.max(0.5, scale - 0.2);
                renderPage(currentPage);
            });
            document.getElementById('zoomIn').addEventListener('click', () => {
                scale = Math.min(3.0, scale + 0.2);
                renderPage(currentPage);
            });
            document.getElementById('downloadPdf').addEventListener('click', () => {
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'resume.pdf';
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            });

            document.getElementById('downloadTex').addEventListener('click', async () => {
                try {
                    const resumeData = window.DataManager.collectResumeData();
                    const response = await fetch('/api/generate-resume-tex', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(resumeData)
                    });

                    if (response.ok) {
                        const texSource = await response.text();
                        const blob = new Blob([texSource], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'resume.tex';
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } else {
                        alert('Failed to generate LaTeX source.');
                    }
                } catch (error) {
                    console.error('TeX Download Error:', error);
                    alert('Error downloading LaTeX source.');
                }
            });

            await renderPage(currentPage);
        } catch (error) {
            console.error('PDF Render Error:', error);
            container.innerHTML = `
                <div class="p-4 text-center">
                    <div class="text-danger mb-3">Error displaying PDF: ${error.message}</div>
                    <button class="make-button" onclick="const url=URL.createObjectURL(window.PreviewManager.lastPDFBlob); const a=document.createElement('a'); a.href=url; a.download='resume.pdf'; a.click();">
                        <i class="fas fa-download me-2"></i>Download PDF Instead
                    </button>
                </div>`;
        }
    },

    hashObject: function (obj) {
        return JSON.stringify(obj).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    },

    throttle: function (func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

window.PreviewManager = PreviewManager;
