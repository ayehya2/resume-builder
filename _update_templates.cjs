const fs = require('fs');
const path = require('path');

const dir = path.join('H:', 'Github', '1IMPORTANT', 'Resume Builder', 'src', 'templates', 'html');
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
    let changes = 0;

    // Replace hardcoded em dash in date ranges
    const jobDateOld = content;
    content = content.split('{job.startDate} \u2014 {job.endDate}').join('{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}');
    if (content !== jobDateOld) changes++;

    const projDateOld = content;
    content = content.split('{project.startDate} \u2014 {project.endDate}').join('{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}');
    if (content !== projDateOld) changes++;

    // Replace unconditional award.summary with showAwardsSummaries check
    const awardOld = content;
    content = content.split('{award.summary && <').join('{formatting.showAwardsSummaries && award.summary && <');
    if (content !== awardOld) changes++;

    fs.writeFileSync(filePath, content);
    console.log('Updated ' + t + ' (' + changes + ' change types)');
});
