import { useState, useEffect, useRef, memo } from 'react';
import { useResumeStore } from '../../store';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/templateResolver';
import { getPDFTemplateComponent, isLatexTemplate } from '../../lib/pdfTemplateMap';
import { pdfToImage, blobToImage } from '../../lib/pdfToImage';
import { generateLaTeXFromData } from '../../lib/latexGenerator';
import { compileLatexViaApi } from '../../lib/latexApiCompiler';
import type { TemplateId } from '../../types';

interface PDFThumbnailProps {
    templateId: TemplateId;
}

/**
 * PDFThumbnail generates a high-fidelity thumbnail image from the actual PDF
 * template. For LaTeX templates, it compiles via the real pdfTeX API.
 * Debounces re-renders (~600ms for non-LaTeX, ~1200ms for LaTeX due to API latency).
 */
export const PDFThumbnail = memo(function PDFThumbnail({ templateId }: PDFThumbnailProps) {
    const { resumeData, customLatexSource, latexFormatting } = useResumeStore();
    const { customTemplates } = useCustomTemplateStore();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const generationId = useRef(0);

    const baseEffectiveData = getEffectiveResumeData(resumeData, customTemplates);
    const effectiveData = { ...baseEffectiveData, selectedTemplate: templateId };

    const formattingFingerprint = JSON.stringify(effectiveData.formatting);
    const fingerprint = `${templateId}-${formattingFingerprint}-${effectiveData.basics.name}-${effectiveData.sections.join(',')}-${effectiveData.work.length}-${effectiveData.education.length}-${effectiveData.skills.length}-${customLatexSource ? 'custom' : 'auto'}`;

    useEffect(() => {
        const currentId = ++generationId.current;
        const isLatex = isLatexTemplate(templateId);

        // Longer debounce for LaTeX to avoid hammering the API
        const debounceMs = isLatex ? 1200 : 600;

        const timer = setTimeout(async () => {
            if (currentId !== generationId.current) return;

            setIsLoading(true);
            setHasError(false);

            try {
                let url: string | null = null;

                if (isLatex) {
                    // Real LaTeX compilation via API
                    const texSource = customLatexSource || generateLaTeXFromData(effectiveData, templateId, latexFormatting);
                    const blob = await compileLatexViaApi(texSource);
                    if (currentId !== generationId.current) return;
                    url = await blobToImage(blob, 1.5);
                } else {
                    const component = getPDFTemplateComponent(effectiveData, 'resume');
                    url = await pdfToImage(component, 1.5);
                }

                if (currentId !== generationId.current) return;

                if (url) {
                    setImageUrl(url);
                    setHasError(false);
                } else {
                    setHasError(true);
                }
            } catch (err) {
                if (currentId !== generationId.current) return;
                console.error('[PDFThumbnail] Generation failed:', err);
                setHasError(true);
            } finally {
                if (currentId === generationId.current) {
                    setIsLoading(false);
                }
            }
        }, debounceMs);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprint]);

    if (isLoading && !imageUrl) {
        return (
            <div className="w-full flex items-center justify-center py-16" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--card-border)', borderTopColor: 'var(--accent)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--main-text-secondary)' }}>
                        {isLatexTemplate(templateId) ? 'Compiling...' : 'Generating...'}
                    </span>
                </div>
            </div>
        );
    }

    if (hasError && !imageUrl) {
        return (
            <div className="w-full flex items-center justify-center py-16" style={{ backgroundColor: 'var(--card-bg)' }}>
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                        {isLatexTemplate(templateId) ? 'LaTeX compilation failed' : 'Preview unavailable'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative bg-white">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`Template ${templateId} preview`}
                    className="w-full block"
                    draggable={false}
                />
            )}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--card-border)', borderTopColor: 'var(--accent)' }} />
                </div>
            )}
        </div>
    );
});
