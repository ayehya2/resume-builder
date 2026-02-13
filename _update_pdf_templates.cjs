const fs = require('fs');
const path = require('path');

const dir = path.join('H:', 'Github', '1IMPORTANT', 'Resume Builder', 'src', 'templates', 'pdf');
const templates = [
    'ClassicPDFTemplate.tsx',
    'ModernPDFTemplate.tsx',
    'MinimalPDFTemplate.tsx',
    'ExecutivePDFTemplate.tsx',
    'CreativePDFTemplate.tsx',
    'TechnicalPDFTemplate.tsx',
    'ElegantPDFTemplate.tsx',
    'CompactPDFTemplate.tsx',
    'AcademicPDFTemplate.tsx',
    'LaTeXPDFTemplate.tsx'
];

templates.forEach(t => {
    const filePath = path.join(dir, t);
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;

    // 1. Add getPDFDateSeparator to import if not already there
    if (!content.includes('getPDFDateSeparator')) {
        // Try to add after last existing import from pdfFormatting
        content = content.replace(
            /} from ['"]\.\.\/\.\.\/lib\/pdfFormatting['"]/,
            ", getPDFDateSeparator } from '../../lib/pdfFormatting'"
        );
        changes++;
    }

    // 2. Replace hardcoded em dash in date ranges
    const before = content;
    content = content.split('{job.startDate} \u2014 {job.endDate}').join('{job.startDate}{getPDFDateSeparator(formatting.dateSeparator)}{job.endDate}');
    content = content.split('{project.startDate} \u2014 {project.endDate}').join('{project.startDate}{getPDFDateSeparator(formatting.dateSeparator)}{project.endDate}');
    if (content !== before) changes++;

    // 3. Replace unconditional award.summary with showAwardsSummaries check
    const awardBefore = content;
    content = content.split('{award.summary && <').join('{formatting.showAwardsSummaries && award.summary && <');
    content = content.split('{award.summary && (').join('{formatting.showAwardsSummaries && award.summary && (');
    if (content !== awardBefore) changes++;

    fs.writeFileSync(filePath, content);
    console.log('Updated ' + t + ' (' + changes + ' change types)');
});
