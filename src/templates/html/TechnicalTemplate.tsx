import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize, getSubHeaderWeight, getSkillSeparator, getBodyTextWeight, getDateSeparatorChar } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function TechnicalTemplate() {
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
            {/* Header — code-style with monospace accents */}
            <div style={{ textAlign: formatting.headerAlignment, marginBottom: '14pt', borderBottom: `2pt solid ${colorValue}`, paddingBottom: '10pt' }}>
                <h1
                    style={{
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : '400',
                        color: '#1a1a1a',
                        marginBottom: '4pt',
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '9pt', color: '#666666', fontFamily: '"Courier New", Courier, monospace' }}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span style={{ color: colorValue, margin: '0 6pt' }}>{'|'}</span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span style={{ color: colorValue, margin: '0 6pt' }}>{'|'}</span>}
                    {basics.address && <span>{basics.address}</span>}
                </div>
                {basics.websites.length > 0 && (
                    <div style={{ fontSize: '9pt', marginTop: '4pt', fontFamily: '"Courier New", Courier, monospace' }}>
                        {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                            <span key={idx}>
                                {idx > 0 && <span style={{ color: colorValue, margin: '0 6pt' }}>{'|'}</span>}
                                <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'none' }}>
                                    {site.name || site.url}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Skills — prominent, tag-style */}
            {skills.length > 0 && sections.includes('skills') && (
                <div style={{ marginBottom: '14pt' }}>
                    <h2
                        style={{
                            fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                            fontWeight: 'bold',
                            color: '#1a1a1a',
                            textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                            marginBottom: '6pt',
                            fontFamily: '"Courier New", Courier, monospace',
                            breakInside: 'avoid',
                        }}
                    >
                        <span style={{ color: colorValue }}>{'> '}</span>Skills
                    </h2>
                    {skills.map((skillGroup: Skill, idx: number) => (
                        <div key={idx} style={{ marginBottom: '4pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                            <span style={{ fontWeight: 'bold', fontFamily: '"Courier New", Courier, monospace', color: colorValue }}>{skillGroup.category}: </span>
                            {formatting.skillLayout === 'inline-tags' ? (
                                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '3px' }}>
                                    {skillGroup.items.map((item, i) => (
                                        <span key={i} style={{ background: `${colorValue}15`, border: `1px solid ${colorValue}30`, padding: '1px 6px', borderRadius: '2px', fontSize: '0.85em', fontFamily: '"Courier New", Courier, monospace' }}>{item}</span>
                                    ))}
                                </span>
                            ) : (
                                <span style={{ color: '#333333' }}>{skillGroup.items.join(getSkillSeparator(formatting.skillLayout))}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Remaining sections */}
            {sections.map((sectionKey: SectionKey) => {
                const sectionHeaderStyle = {
                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                    fontWeight: 'bold' as const,
                    color: '#1a1a1a',
                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                    marginBottom: '8pt',
                    fontFamily: '"Courier New", Courier, monospace',
                    breakInside: 'avoid' as const,
                };

                if (sectionKey === 'profile' && basics.summary) {
                    return (
                        <div key="profile" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>Profile
                            </h2>
                            <div style={{ fontSize: '9.5pt', color: '#333333', lineHeight: '1.5', borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt' }}>
                                {basics.summary}
                            </div>
                        </div>
                    );
                }
                if (sectionKey === 'skills') return null; // Already rendered above

                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>Education
                            </h2>
                            {education.map((edu: Education, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight), fontSize: '10.5pt' }}>{edu.institution}</span>
                                        <span style={{ fontSize: '9pt', color: '#888888', fontFamily: '"Courier New", Courier, monospace' }}>{edu.graduationDate}</span>
                                    </div>
                                    <div style={{ fontSize: '9.5pt', color: '#555555' }}>
                                        {edu.degree}{edu.field && ` in ${edu.field}`}
                                    </div>
                                    {formatting.showGPA && edu.gpa && <div style={{ fontSize: '9pt', color: '#888888' }}>GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>Experience
                            </h2>
                            {work.map((job: WorkExperience, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight), fontSize: '10.5pt' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</span>
                                        <span style={{ fontSize: '9pt', color: '#888888', fontFamily: '"Courier New", Courier, monospace' }}>{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}</span>
                                    </div>
                                    <div style={{ fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
                                        {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location && ` · ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1.5pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                    <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
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
                        <div key="projects" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>Projects
                            </h2>
                            {projects.map((project: Project, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <div className="flex items-center gap-2">
                                            <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{project.name}</span>
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '9pt', color: colorValue, fontFamily: '"Courier New", Courier, monospace' }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '9pt', color: '#888888', fontFamily: '"Courier New", Courier, monospace' }}>{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}</span>
                                    </div>
                                    {project.keywords && project.keywords.length > 0 && (
                                        <div style={{ fontSize: '8.5pt', color: '#999999', fontFamily: '"Courier New", Courier, monospace', marginBottom: '2pt' }}>
                                            [{project.keywords.join(', ')}]
                                        </div>
                                    )}
                                    {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                    <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
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

                if (sectionKey === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>Awards
                            </h2>
                            {awards.map((award: Award, idx: number) => (
                                <div key={idx} style={{ fontSize: '9.5pt', marginBottom: '4pt', borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt', breakInside: 'avoid' }}>
                                    <span style={{ fontWeight: 'bold' }}>{award.title}</span>
                                    {award.date && <span style={{ color: '#888888', fontFamily: '"Courier New", Courier, monospace' }}> [{award.date}]</span>}
                                    {award.awarder && <span style={{ color: '#888888', fontStyle: 'italic' }}> — {award.awarder}</span>}
                                    {formatting.showAwardsSummaries && award.summary && <div style={{ fontSize: '9pt', color: '#666666', marginTop: '2pt' }}>{award.summary}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                // Custom sections
                const customSection = customSections.find((cs: CustomSection) => cs.id === sectionKey);
                if (customSection && customSection.items && customSection.items.length > 0) {
                    return (
                        <div key={customSection.id} style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>
                                <span style={{ color: colorValue }}>{'> '}</span>{customSection.title}
                            </h2>
                            {customSection.items.map((entry, idx) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: 'bold', fontSize: '10.5pt' }}>{entry.title}</span>
                                        <span style={{ fontSize: '9pt', color: '#888888', fontFamily: '"Courier New", Courier, monospace' }}>{entry.date}</span>
                                    </div>
                                    {entry.subtitle && (
                                        <div style={{ fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
                                            {entry.subtitle}{entry.location && ` · ${entry.location}`}
                                        </div>
                                    )}
                                    {customSection.type === 'bullets' ? (
                                        entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1.5pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                        <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                        <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )
                                    ) : (
                                        entry.bullets && entry.bullets[0] && (
                                            <div style={{ fontSize: '9.5pt', color: '#333333', lineHeight: '1.5', borderLeft: `2pt solid ${colorValue}20`, paddingLeft: '10pt' }}>
                                                {parseBoldText(entry.bullets[0])}
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}
