const { stripIndent, source } = require('common-tags');
const { WHITESPACE } = require('./constants');

// Font mappings for LaTeX
const FONT_FAMILIES = {
    'default': '', // Computer Modern (default LaTeX font)
    'times': '\\usepackage{times}',
    'arial': '\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}',
    'calibri': '\\usepackage{calibri}',
    'georgia': '\\usepackage{mathptmx}',
    'helvetica': '\\usepackage{helvet}\\renewcommand{\\familydefault}{\\sfdefault}',
    'palatino': '\\usepackage{palatino}',
    'garamond': '\\usepackage{ebgaramond}'
};

const BULLET_STYLES = {
    'bullet': '\\bullet',
    'dash': '--',
    'arrow': '$\\rightarrow$',
    'circle': '$\\circ$',
    'square': '$\\blacksquare$',
    'diamond': '$\\diamond$',
    'star': '$\\star$',
    'chevron': '$\\gg$'
};

const COLOR_THEMES = {
    'black': '',
    'navy': '\\usepackage{xcolor}\\definecolor{primarycolor}{RGB}{0,51,102}',
    'darkblue': '\\usepackage{xcolor}\\definecolor{primarycolor}{RGB}{25,25,112}',
    'darkgreen': '\\usepackage{xcolor}\\definecolor{primarycolor}{RGB}{0,100,0}',
    'maroon': '\\usepackage{xcolor}\\definecolor{primarycolor}{RGB}{128,0,0}',
    'purple': '\\usepackage{xcolor}\\definecolor{primarycolor}{RGB}{75,0,130}'
};

const generator = {
    profileSection(basics, formatting = {}) {
        if (!basics) {
            return '';
        }

        const { name, email, phone, location, websites = [] } = basics;
        const address = location?.address || '';
        const websiteLines = websites.map(website => `\\href{${website.url}}{${website.name}}`);

        let line1 = name ? `{\\Huge \\scshape {${name}}}` : '';
        let line2 = [address, email, phone, ...websiteLines]
            .filter(Boolean)
            .join(' $\\cdot$ ');

        if (line1 && line2) {
            line1 += '\\\\';
            line2 += '\\\\';
        }

        return stripIndent`
            %==== Profile ====%
            \\vspace*{-10pt}
            \\begin{center}
                ${line1}
                ${line2}
            \\end{center}
        `;
    },

    educationSection(education, heading, formatting = {}) {
        if (!education || !education.length) {
            return '';
        }

        return source`
            %==== Education ====%
            \\header{${heading || 'Education'}}
            ${education.map((school) => {
                const {
                    institution,
                    location,
                    studyType,
                    area,
                    score,
                    startDate,
                    endDate
                } = school;

                let line1 = '';
                let line2 = '';

                if (institution) {
                    line1 += `\\textbf{${institution}}`;
                }

                if (location) {
                    line1 += `\\hfill ${location}`;
                }

                if (studyType) {
                    line2 += studyType;
                }

                if (area) {
                    line2 += studyType ? ` ${area}` : `Degree in ${area}`;
                }

                if (score) {
                    line2 += ` \\textit{GPA: ${score}}`;
                }

                if (startDate || endDate) {
                    const gradLine = `${startDate || ''} - ${endDate || ''}`;
                    line2 += line2 ? ` \\hfill ${gradLine}` : gradLine;
                }

                if (line1) {
                    line1 += '\\\\';
                }

                if (line2) {
                    line2 += '\\\\';
                }

                return stripIndent`
                    ${line1}
                    ${line2.trim()}
                    \\vspace{2mm}
                `;
            }).join('')}
        `;
    },

    workSection(work, heading, formatting = {}) {
        if (!work || !work.length) {
            return '';
        }

        const bulletSymbol = BULLET_STYLES[formatting.bulletStyle] || '\\bullet';
        const bulletSpacing = formatting.bulletSpacing || 'normal';
        const itemSep = bulletSpacing === 'tight' ? '0pt' : bulletSpacing === 'relaxed' ? '2pt' : bulletSpacing === 'spacious' ? '3pt' : '1pt';

        return source`
            %==== Experience ====%
            \\header{${heading || 'Experience'}}
            \\vspace{1mm}

            ${work.map((job) => {
                const { name, position, location, startDate, endDate, highlights } = job;

                let line1 = '';
                let line2 = '';
                let highlightLines = '';

                if (name) {
                    line1 += `\\textbf{${name}}`;
                }

                if (location) {
                    line1 += ` \\hfill ${location}`;
                }

                if (position) {
                    line2 += `\\textit{${position}}`;
                }

                if (startDate && endDate) {
                    line2 += ` \\hfill ${startDate} - ${endDate}`;
                } else if (startDate) {
                    line2 += ` \\hfill ${startDate} - Present`;
                } else if (endDate) {
                    line2 += ` \\hfill ${endDate}`;
                }

                if (line1) line1 += '\\\\';
                if (line2) line2 += '\\\\';

                if (highlights && highlights.length) {
                    highlightLines = source`
                        \\vspace{-1mm}
                        \\begin{itemize} \\itemsep ${itemSep}
                            ${highlights.map((highlight) => `\\item[${bulletSymbol}] ${highlight}`).join('\n            ')}
                        \\end{itemize}
                    `;
                }

                return stripIndent`
                    ${line1}
                    ${line2}
                    ${highlightLines}
                `;
            }).join('')}
        `;
    },

    skillsSection(skills, heading, formatting = {}) {
        if (!skills || !skills.length) {
            return '';
        }

        return source`
            \\header{${heading || 'Skills'}}
            \\begin{tabular}{ l l }
            ${skills.map((skill) => {
                const { name = 'Misc', keywords = [] } = skill;
                return `${name}: & ${keywords.join(', ')} \\\\`;
            }).join('\n            ')}
            \\end{tabular}
            \\vspace{2mm}
        `;
    },

    projectsSection(projects, heading, formatting = {}) {
        if (!projects || !projects.length) {
            return '';
        }

        return source`
            \\header{${heading || 'Projects'}}
            ${projects.map((project) => {
                if (Object.keys(project).length === 0) {
                    return '';
                }

                const { name, description, keywords, url, urlName } = project;

                let line1 = '';
                let line2 = description || '';

                if (name) {
                    line1 += `{\\textbf{${name}}}`;
                }

                if (keywords && keywords.length) {
                    line1 += ` {\\sl ${keywords.join(', ')}} `;
                }

                if (url) {
                    const displayText = urlName || url;
                    line1 += `\\hfill \\href{${url}}{${displayText}}`;
                }

                if (line1) {
                    line1 += '\\\\';
                }

                if (line2) {
                    line2 += '\\\\';
                }

                return stripIndent`
                    ${line1}
                    ${line2}
                    \\vspace*{2mm}
                `;
            }).join('')}
        `;
    },

    awardsSection(awards, heading, formatting = {}) {
        if (!awards || !awards.length) {
            return '';
        }

        return source`
            \\header{${heading || 'Awards'}}
            ${awards.map((award) => {
                const { title, summary, date, awarder } = award;

                let line1 = '';
                let line2 = summary || '';

                if (title) {
                    line1 += `\\textbf{${title}}`;
                }

                if (awarder) {
                    line1 += ` \\hfill ${awarder}`;
                }

                if (date) {
                    line2 += ` \\hfill ${date}`;
                }

                if (line1) line1 += '\\\\';
                if (line2) line2 += '\\\\';

                return stripIndent`
                    ${line1}
                    ${line2}
                    \\vspace*{2mm}
                `;
            }).join('')}
        `;
    },

    resumeHeader() {
        return stripIndent`
            %\\renewcommand{\\encodingdefault}{cg}
            %\\renewcommand{\\rmdefault}{lgrcmr}

            \\def\\bull{\\vrule height 0.8ex width .7ex depth -.1ex }

            % DEFINITIONS FOR RESUME %%%%%%%%%%%%%%%%%%%%%%%

            \\newcommand{\\area} [2] {
                \\vspace*{-9pt}
                \\begin{verse}
                    \\textbf{#1}   #2
                \\end{verse}
            }

            \\newcommand{\\lineunder} {
                \\vspace*{-8pt} \\\\
                \\hspace*{-18pt} \\hrulefill \\\\
            }

            \\newcommand{\\header} [1] {
                {\\hspace*{-18pt}\\vspace*{6pt} \\textsc{#1}}
                \\vspace*{-6pt} \\lineunder
            }

            \\newcommand{\\employer} [3] {
                { \\textbf{#1} (#2)\\\\ \\underline{\\textbf{\\emph{#3}}}\\\\  }
            }

            \\newcommand{\\contact} [3] {
                \\vspace*{-10pt}
                \\begin{center}
                    {\\Huge \\scshape {#1}}\\\\
                    #2 \\\\ #3
                \\end{center}
                \\vspace*{-8pt}
            }

            \\newenvironment{achievements}{
                \\begin{list}
                    {$\\bullet$}{\\topsep 0pt \\itemsep -2pt}}{\\vspace*{4pt}
                \\end{list}
            }

            \\newcommand{\\schoolwithcourses} [4] {
                \\textbf{#1} #2 $\\bullet$ #3\\\\
                #4 \\\\
                \\vspace*{5pt}
            }

            \\newcommand{\\school} [4] {
                \\textbf{#1} #2 $\\bullet$ #3\\\\
                #4 \\\\
            }
            % END RESUME DEFINITIONS %%%%%%%%%%%%%%%%%%%%%%%
        `;
    }
};

function template1(values) {
    const { headings = {}, formatting = {} } = values;

    // Extract formatting settings with defaults
    const {
        fontFamily = 'default',
        baseFontSize = '11pt',
        lineSpacing = '1.0',
        bulletStyle = 'bullet',
        colorTheme = 'black',
        pageMargins = 'normal',
        marginTop = '0.8',
        marginBottom = '0.8',
        marginLeft = '0.8',
        marginRight = '0.8'
    } = formatting;

    // Calculate margins
    let margins = 'left=0.8in,right=0.8in,bottom=0.8in,top=0.8in';
    if (pageMargins === 'narrow') {
        margins = 'left=0.5in,right=0.5in,bottom=0.5in,top=0.5in';
    } else if (pageMargins === 'wide') {
        margins = 'left=1.0in,right=1.0in,bottom=1.0in,top=1.0in';
    } else if (pageMargins === 'custom') {
        margins = `left=${marginLeft}in,right=${marginRight}in,bottom=${marginBottom}in,top=${marginTop}in`;
    }

    // Build document class and packages
    const documentClass = `\\documentclass[${baseFontSize}]{article}`;
    const fontPackage = FONT_FAMILIES[fontFamily] || '';
    const colorPackage = COLOR_THEMES[colorTheme] || '';

    return stripIndent`
        ${documentClass}
        \\usepackage{fullpage}
        \\usepackage{amsmath}
        \\usepackage{amssymb}
        \\usepackage{textcomp}
        \\usepackage[utf8]{inputenc}
        \\usepackage[T1]{fontenc}
        ${fontPackage}
        ${colorPackage}
        \\textheight=10in
        \\pagestyle{empty}
        \\raggedright
        \\usepackage[${margins}]{geometry}
        \\usepackage[hidelinks]{hyperref}
        \\renewcommand{\\baselinestretch}{${lineSpacing}}

        ${generator.resumeHeader()}

        \\begin{document}
        \\vspace*{-40pt}

        ${values.sections
            .map((section) => {
                switch (section) {
                    case 'profile':
                        return generator.profileSection(values.basics, formatting);

                    case 'education':
                        return generator.educationSection(
                            values.education,
                            headings.education,
                            formatting
                        );

                    case 'work':
                        return generator.workSection(values.work, headings.work, formatting);

                    case 'skills':
                        return generator.skillsSection(values.skills, headings.skills, formatting);

                    case 'projects':
                        return generator.projectsSection(values.projects, headings.projects, formatting);

                    case 'awards':
                        return generator.awardsSection(values.awards, headings.awards, formatting);

                    default:
                        return '';
                }
            })
            .join('\n\n')}

        ${WHITESPACE}
        \\end{document}
    `;
}

module.exports = template1;