import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import type { TemplateId } from '../types';

interface TemplateRendererProps {
    templateId: TemplateId;
}

export function TemplateRenderer({ templateId }: TemplateRendererProps) {
    switch (templateId) {
        case 1:
            return <ClassicTemplate />;
        case 2:
            return <ModernTemplate />;
        case 3:
            return <TechnicalTemplate />;
        case 4:
            return <ExecutiveTemplate />;
        default:
            return <ClassicTemplate />;
    }
}
