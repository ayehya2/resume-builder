import { useState, useEffect, useRef, memo } from 'react';
import { useResumeStore } from '../../store';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getEffectiveResumeData } from '../../lib/templateResolver';
import { getPDFTemplateComponent } from '../../lib/pdfTemplateMap';
import { pdfToImage } from '../../lib/pdfToImage';
import type { TemplateId } from '../../types';

interface PDFThumbnailProps {
    templateId: TemplateId;
}

/**
 * PDFThumbnail generates a high-fidelity thumbnail image from the actual PDF
 * template. It debounces re-renders to avoid generating a new image on every
 * keystroke (~600ms delay).
 */
export const PDFThumbnail = memo(function PDFThumbnail({ templateId }: PDFThumbnailProps) {
    const { resumeData } = useResumeStore();
    const { customTemplates } = useCustomTemplateStore();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const generationId = useRef(0);

    // Build effective data, but override selectedTemplate with the thumbnail's own templateId
    const baseEffectiveData = getEffectiveResumeData(resumeData, customTemplates);
    const effectiveData = { ...baseEffectiveData, selectedTemplate: templateId };

    // Fingerprint includes templateId + key formatting + data fields for reactivity
    const formattingFingerprint = JSON.stringify(effectiveData.formatting);
    const fingerprint = `${templateId}-${formattingFingerprint}-${effectiveData.basics.name}-${effectiveData.sections.join(',')}-${effectiveData.work.length}-${effectiveData.education.length}-${effectiveData.skills.length}`;

    useEffect(() => {
        const currentId = ++generationId.current;

        // Debounce: wait 600ms before generating thumbnail
        const timer = setTimeout(async () => {
            if (currentId !== generationId.current) return; // stale

            setIsLoading(true);

            const component = getPDFTemplateComponent(effectiveData, 'resume');
            const url = await pdfToImage(component, 1.5); // 1.5× scale for thumbnails

            if (currentId !== generationId.current) return; // stale

            setImageUrl(url);
            setIsLoading(false);
        }, 600);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fingerprint]);

    if (isLoading && !imageUrl) {
        // First load — show skeleton
        return (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Generating...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-white">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={`Template ${templateId} preview`}
                    className="w-full h-full object-contain object-top"
                    draggable={false}
                />
            )}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});
