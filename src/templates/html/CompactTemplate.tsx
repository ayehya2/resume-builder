import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize, getSubHeaderWeight, getSkillSeparator, getBodyTextWeight, getDateSeparatorChar } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function CompactTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting, customSections } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    return (
        <div
            className="bg-white text-left"
            style={{
                fontFamily: getFontFamilyCSS(formatting.fontFamily),
                fontSize: formatting.baseFontSize,
                lineHeight: formatting.lineSpacing,
                padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                color: '#1a1a1a',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
            }}
        >
            {/* Compact Header */}
            <div style={{ textAlign: formatting.headerAlignment, marginBottom: '8pt', paddingBottom: '6pt', borderBottom: `2px solid ${colorValue}` }}>
                <h1
                    style={{
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : 'normal',
                        color: colorValue,
                        marginBottom: '2pt',
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '8.5pt', color: '#555555' }}>
                    {basics.email && basics.email}
                    {basics.email && basics.phone && ` ${formatting.separator} `}
                    {basics.phone && basics.phone}
                    {(basics.email || basics.phone) && basics.address && ` ${formatting.separator} `}
                    {basics.address && basics.address}
                    {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && ` ${formatting.separator} `}
                    {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                        <span key={idx}>
                            {idx > 0 && ` ${formatting.separator} `}
                            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'none' }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
            </div>

            {/* Two Column Body */}
            <div style={{ display: 'flex', gap: '16pt' }}>
                {/* Left Column - Main Content (wider) */}
                <div style={{ flex: 2 }}>
                    {sections.map((sectionKey: SectionKey) => {
                        const sectionHeaderStyle = {
                            fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                            fontWeight: (formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal') as any,
                            textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                            textDecoration: formatting.sectionTitleUnderline ? 'underline' as const : 'none' as const,
                            color: colorValue,
                            marginBottom: '4pt',
                            paddingBottom: '2pt',
                            borderBottom: formatting.sectionDividers !== 'none' ? `1px solid ${colorValue}` : 'none',
                        };

                        if (sectionKey === 'profile' && basics.summary) {
                            return (
                                <div key="profile" style={{ marginBottom: '8pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sectionHeaderStyle}>Summary</h2>
                                    <div style={{ fontSize: '9pt', color: '#333333', lineHeight: '1.4' }}>
                                        {basics.summary}
                                    </div>
                                </div>
                            );
                        }

                        if (sectionKey === 'work' && work.length > 0) {
                            return (
                                <div key="work" style={{ marginBottom: '8pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sectionHeaderStyle}>Experience</h2>
                                    {work.map((job: WorkExperience, idx: number) => (
                                        <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                            <div className="flex justify-between items-baseline">
                                                <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight), fontSize: '9.5pt' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company} — <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{formatting.companyTitleOrder === 'title-first' ? job.company : job.position}</span></span>
                                                <span style={{ fontSize: '8pt', color: '#888888', whiteSpace: 'nowrap', marginLeft: '8pt' }}>{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}</span>
                                            </div>
                                            {formatting.showLocation && job.location && <div style={{ fontSize: '8pt', color: '#999999' }}>{job.location}</div>}
                                            {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                                <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                    {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                        <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '8.5pt', breakInside: 'avoid' }}>
                                                            <span className="flex-shrink-0" style={{ color: colorValue, fontSize: '7pt' }}>{bulletSymbol}</span>
                                                            <span>{parseBoldText(line.replace(/^[•*-]\s*/, ''))}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (sectionKey === 'projects' && projects.length > 0) {
                            return (
                                <div key="projects" style={{ marginBottom: '8pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sectionHeaderStyle}>Projects</h2>
                                    {projects.map((project: Project, idx: number) => (
                                        <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                            <div className="flex justify-between items-baseline">
                                                <div className="flex items-center gap-1">
                                                    <span style={{ fontWeight: 'bold', fontSize: '9.5pt' }}>{project.name}</span>
                                                    {project.url && (
                                                        <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '7.5pt', color: colorValue }}>[{project.urlName || 'Link'}]</a>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: '8pt', color: '#888888', whiteSpace: 'nowrap' }}>{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}</span>
                                            </div>
                                            {project.keywords && project.keywords.length > 0 && (
                                                <div style={{ fontSize: '7.5pt', color: '#999999' }}>{project.keywords.join(' · ')}</div>
                                            )}
                                            {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                                <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                    {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                        <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '8.5pt', breakInside: 'avoid' }}>
                                                            <span className="flex-shrink-0" style={{ color: colorValue, fontSize: '7pt' }}>{bulletSymbol}</span>
                                                            <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        // Custom sections in left column
                        const customSection = customSections.find((cs: CustomSection) => cs.id === sectionKey);
                        if (customSection && customSection.items && customSection.items.length > 0) {
                            return (
                                <div key={customSection.id} style={{ marginBottom: '8pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sectionHeaderStyle}>{customSection.title}</h2>
                                    {customSection.items.map((entry, idx) => (
                                        <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                            <div className="flex justify-between items-baseline">
                                                <span style={{ fontWeight: 'bold', fontSize: '9.5pt' }}>{entry.title} {entry.subtitle && <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>— {entry.subtitle}</span>}</span>
                                                <span style={{ fontSize: '8pt', color: '#888888', whiteSpace: 'nowrap', marginLeft: '8pt' }}>{entry.date}</span>
                                            </div>
                                            {entry.location && <div style={{ fontSize: '8pt', color: '#999999' }}>{entry.location}</div>}
                                            {customSection.type === 'bullets' ? (
                                                entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                                    <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                        {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                            <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '8.5pt', breakInside: 'avoid' }}>
                                                                <span className="flex-shrink-0" style={{ color: colorValue, fontSize: '7pt' }}>{bulletSymbol}</span>
                                                                <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )
                                            ) : (
                                                entry.bullets && entry.bullets[0] && (
                                                    <div style={{ fontSize: '8.5pt', color: '#333333', lineHeight: '1.4' }}>
                                                        {parseBoldText(entry.bullets[0])}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        // Skip skills, education, awards - they go in the right column
                        return null;
                    })}
                </div>

                {/* Right Column - Supplementary */}
                <div style={{ flex: 1, borderLeft: `1px solid ${colorValue}30`, paddingLeft: '12pt' }}>
                    {sections.map((sectionKey: SectionKey) => {
                        const sideHeaderStyle = {
                            fontSize: '9pt',
                            fontWeight: 'bold' as const,
                            color: colorValue,
                            textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                            marginBottom: '4pt',
                            paddingBottom: '2pt',
                            borderBottom: `1px solid ${colorValue}40`,
                            letterSpacing: '1px',
                        };

                        if (sectionKey === 'education' && education.length > 0) {
                            return (
                                <div key="education" style={{ marginBottom: '10pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sideHeaderStyle}>Education</h2>
                                    {education.map((edu: Education, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '6pt', fontSize: '8.5pt', breakInside: 'avoid' }}>
                                            <div style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>{edu.institution}</div>
                                            <div style={{ color: '#555555', fontSize: '8pt' }}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                                            <div style={{ color: '#888888', fontSize: '7.5pt' }}>{edu.graduationDate}</div>
                                            {formatting.showGPA && edu.gpa && <div style={{ fontSize: '7.5pt', color: '#888888' }}>GPA: {edu.gpa}</div>}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (sectionKey === 'skills' && skills.length > 0) {
                            return (
                                <div key="skills" style={{ marginBottom: '10pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sideHeaderStyle}>Skills</h2>
                                    {skills.map((skillGroup: Skill, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '4pt', breakInside: 'avoid' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '8pt', color: '#333333' }}>{skillGroup.category}</div>
                                            <div style={{ fontSize: '7.5pt', color: '#666666', lineHeight: '1.4' }}>
                                                {formatting.skillLayout === 'inline-tags' ? (
                                                    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px' }}>
                                                        {skillGroup.items.map((item, i) => (
                                                            <span key={i} style={{ background: `${colorValue}15`, padding: '0px 4px', borderRadius: '2px', fontSize: '7pt' }}>{item}</span>
                                                        ))}
                                                    </span>
                                                ) : (
                                                    skillGroup.items.join(getSkillSeparator(formatting.skillLayout))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        if (sectionKey === 'awards' && awards.length > 0) {
                            return (
                                <div key="awards" style={{ marginBottom: '10pt', breakInside: 'avoid-page' }}>
                                    <h2 style={sideHeaderStyle}>Awards</h2>
                                    {awards.map((award: Award, idx: number) => (
                                        <div key={idx} style={{ marginBottom: '4pt', fontSize: '8pt', breakInside: 'avoid' }}>
                                            <div style={{ fontWeight: 'bold' }}>{award.title}</div>
                                            {award.date && <div style={{ color: '#888888', fontSize: '7.5pt' }}>{award.date}</div>}
                                            {award.awarder && <div style={{ fontStyle: 'italic', color: '#999999', fontSize: '7.5pt' }}>{award.awarder}</div>}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
