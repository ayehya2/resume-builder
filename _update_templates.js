const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'templates', 'html');
const templates = [
    'ModernTemplate.tsx',
    'MinimalTemplate.tsx',
    'ExecutiveTemplate.tsx',
    'CreativeTemplate.tsx',
    'TechnicalTemplate.tsx',
    'ElegantTemplate.tsx',
    'CompactTemplate.tsx',
    'AcademicTemplate.tsx',
    'LaTeXTemplate.tsx'
];

templates.forEach(t => {
    const filePath = path.join(dir, t);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace hardcoded em dash in date ranges
    content = content.replace(/\{job\.startDate\} \u2014 \{job\.endDate\}/g, '{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}');
    content = content.replace(/\{project\.startDate\} \u2014 \{project\.endDate\}/g, '{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}');

    // Replace unconditional award.summary with showAwardsSummaries check
    content = content.replace(/\{award\.summary && </g, '{formatting.showAwardsSummaries && award.summary && <');

    // Replace unconditional project.keywords with showProjectKeywords check
    // Pattern: <div className="text-xs italic mb-1">\n{project.keywords.join
    content = content.replace(
        /(<div[^>]*className="text-xs italic mb-1"[^>]*>)\s*\n\s*\{project\.keywords\.join\(', '\)\}\s*\n\s*<\/div>/g,
        '{formatting.showProjectKeywords && project.keywords.length > 0 && (\n$1\n{project.keywords.join(\', \')}\n</div>\n)}'
    );

    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${t}`);
});
