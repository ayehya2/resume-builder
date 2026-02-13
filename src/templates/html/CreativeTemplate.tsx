import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getSubHeaderWeight, getSkillSeparator, getBodyTextWeight, getDateSeparatorChar } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function CreativeTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting, customSections } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    // Lighter tint for sidebar backgrounds
    const lightBg = colorValue + '12';

    return (
        <div
            className="bg-white text-left"
            style={{
                fontFamily: getFontFamilyCSS(formatting.fontFamily),
                fontSize: formatting.baseFontSize,
                lineHeight: formatting.lineSpacing,
                color: '#1a1a1a',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                display: 'flex',
            }}
        >
            {/* Left Sidebar */}
            <div
                style={{
                    width: '30%',
                    backgroundColor: lightBg,
                    padding: `0.4in 0.2in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                    flexShrink: 0,
                }}
            >
                {/* Name & Contact */}
                <div style={{ marginBottom: '16pt' }}>
                    <h1
                        style={{
                            color: colorValue,
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            lineHeight: '1.2',
                            marginBottom: '10pt',
                        }}
                    >
                        {basics.name || 'Your Name'}
                    </h1>
                    <div style={{ fontSize: '8.5pt', color: '#555555', lineHeight: '1.6' }}>
                        {basics.email && <div>{basics.email}</div>}
                        {basics.phone && <div>{basics.phone}</div>}
                        {basics.address && <div>{basics.address}</div>}
                    </div>
                    {basics.websites.length > 0 && (
                        <div style={{ marginTop: '8pt', fontSize: '8.5pt' }}>
                            {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                                <div key={idx} style={{ marginBottom: '2pt' }}>
                                    <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'none', fontWeight: '600' }}>
                                        {site.name || site.url}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Skills in sidebar */}
                {skills.length > 0 && (
                    <div style={{ marginBottom: '16pt' }}>
                        <h2
                            style={{
                                fontSize: '10pt',
                                fontWeight: 'bold',
                                color: colorValue,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                marginBottom: '8pt',
                                paddingBottom: '4pt',
                                borderBottom: `1.5pt solid ${colorValue}`,
                            }}
                        >
                            Skills
                        </h2>
                        {skills.map((skillGroup: Skill, idx: number) => (
                            <div key={idx} style={{ marginBottom: '6pt' }}>
                                <div style={{ fontSize: '8.5pt', fontWeight: 'bold', color: '#333333', marginBottom: '2pt' }}>
                                    {skillGroup.category}
                                </div>
                                <div style={{ fontSize: '8pt', color: '#666666', lineHeight: '1.5' }}>
                                    {formatting.skillLayout === 'inline-tags' ? (
                                        <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px' }}>
                                            {skillGroup.items.map((item, i) => (
                                                <span key={i} style={{ background: `${colorValue}20`, padding: '1px 4px', borderRadius: '2px', fontSize: '7.5pt' }}>{item}</span>
                                            ))}
                                        </span>
                                    ) : (
                                        skillGroup.items.join(getSkillSeparator(formatting.skillLayout))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Awards in sidebar */}
                {awards.length > 0 && (
                    <div style={{ marginBottom: '16pt' }}>
                        <h2
                            style={{
                                fontSize: '10pt',
                                fontWeight: 'bold',
                                color: colorValue,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                marginBottom: '8pt',
                                paddingBottom: '4pt',
                                borderBottom: `1.5pt solid ${colorValue}`,
                            }}
                        >
                            Awards
                        </h2>
                        {awards.map((award: Award, idx: number) => (
                            <div key={idx} style={{ marginBottom: '6pt', fontSize: '8.5pt' }}>
                                <div style={{ fontWeight: 'bold', color: '#333333' }}>{award.title}</div>
                                {award.date && <div style={{ color: '#888888', fontSize: '8pt' }}>{award.date}</div>}
                                {award.awarder && <div style={{ fontStyle: 'italic', color: '#888888', fontSize: '8pt' }}>{award.awarder}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div
                style={{
                    flex: 1,
                    padding: `0.4in ${formatting.marginRight}in ${formatting.marginBottom}in 0.25in`,
                }}
            >
                {sections.map((sectionKey: SectionKey) => {
                    const sectionHeaderStyle = {
                        fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                        fontWeight: 'bold' as const,
                        color: colorValue,
                        textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                        marginBottom: '8pt',
                        paddingBottom: '3pt',
                        borderBottom: `1.5pt solid ${colorValue}`,
                        letterSpacing: '1px',
                        breakInside: 'avoid' as const,
                    };

                    if (sectionKey === 'profile' && basics.summary) {
                        return (
                            <div key="profile" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Profile</h2>
                                <div style={{ fontSize: '9.5pt', color: '#333333', lineHeight: '1.5' }}>
                                    {basics.summary}
                                </div>
                            </div>
                        );
                    }

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <div key="education" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Education</h2>
                                {education.map((edu: Education, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>{edu.institution}</span>
                                            <span style={{ fontSize: '9pt', color: '#888888' }}>{edu.graduationDate}</span>
                                        </div>
                                        <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#555555' }}>
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
                                <h2 style={sectionHeaderStyle}>Experience</h2>
                                {work.map((job: WorkExperience, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</span>
                                            <span style={{ fontSize: '9pt', color: '#888888' }}>{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}</span>
                                        </div>
                                        <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
                                            {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location && `, ${job.location}`}
                                        </div>
                                        {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
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
                                <h2 style={sectionHeaderStyle}>Projects</h2>
                                {projects.map((project: Project, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                                                {project.url && (
                                                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '9pt', color: colorValue }}>
                                                        [{project.urlName || 'Link'}]
                                                    </a>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '9pt', color: '#888888' }}>{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}</span>
                                        </div>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <div style={{ fontSize: '8.5pt', color: '#999999', marginBottom: '2pt' }}>
                                                {project.keywords.join(' · ')}
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

                    // Custom sections
                    const customSection = customSections.find((cs: CustomSection) => cs.id === sectionKey);
                    if (customSection && customSection.items && customSection.items.length > 0) {
                        return (
                            <div key={customSection.id} style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>{customSection.title}</h2>
                                {customSection.items.map((entry, idx) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                                            <span style={{ fontSize: '9pt', color: '#888888' }}>{entry.date}</span>
                                        </div>
                                        {entry.subtitle && (
                                            <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
                                                {entry.subtitle}{entry.location && `, ${entry.location}`}
                                            </div>
                                        )}
                                        {customSection.type === 'bullets' ? (
                                            entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                                <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                            <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                            <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        ) : (
                                            entry.bullets && entry.bullets[0] && (
                                                <div style={{ fontSize: '9.5pt', color: '#333333', lineHeight: '1.5' }}>
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
        </div>
    );
}
