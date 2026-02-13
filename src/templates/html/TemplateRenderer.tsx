import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { CreativeTemplate } from './CreativeTemplate';
import { TechnicalTemplate } from './TechnicalTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { CompactTemplate } from './CompactTemplate';
import { AcademicTemplate } from './AcademicTemplate';
import { LaTeXTemplate } from './LaTeXTemplate';
import type { TemplateId } from '../../types';
import { useCustomTemplateStore } from '../../lib/customTemplateStore';
import { getBaseTemplateId } from '../../lib/templateResolver';

interface TemplateRendererProps {
    templateId: TemplateId;
}

export function TemplateRenderer({ templateId }: TemplateRendererProps) {
    const { customTemplates } = useCustomTemplateStore();
    const baseId = getBaseTemplateId(templateId, customTemplates);

    switch (baseId) {
        case 1:
            return <ClassicTemplate />;
        case 2:
            return <ModernTemplate />;
        case 3:
            return <MinimalTemplate />;
        case 4:
            return <ExecutiveTemplate />;
        case 5:
            return <CreativeTemplate />;
        case 6:
            return <TechnicalTemplate />;
        case 7:
            return <ElegantTemplate />;
        case 8:
            return <CompactTemplate />;
        case 9:
            return <AcademicTemplate />;
        case 10:
            return <LaTeXTemplate />;
        default:
            return <ClassicTemplate />;
    }
}

