import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import type { TemplateId } from '../../types';

interface TemplateRendererProps {
    templateId: TemplateId;
}

export function TemplateRenderer({ templateId }: TemplateRendererProps) {
    switch (templateId) {
        case 1:
            return <ClassicTemplate />;
        case 2:
            return <ModernTemplate />;
        default:
            return <ClassicTemplate />;
    }
}
