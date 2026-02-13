import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize, getSubHeaderWeight, getSkillSeparator, getBodyTextWeight, getDateSeparatorChar } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function ExecutiveTemplate() {
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
                color: '#1a1a1a',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
            }}
        >
            {/* Executive Header — clean white header with accent border */}
            <div
                style={{
                    backgroundColor: '#ffffff',
                    padding: `${formatting.marginTop}in ${formatting.marginRight}in 0.15in ${formatting.marginLeft}in`,
                    marginBottom: '0',
                    textAlign: formatting.headerAlignment,
                    borderBottom: `2pt solid ${colorValue}`,
                }}
            >
                <h1
                    style={{
                        color: colorValue,
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : '400',
                        letterSpacing: '1px',
                        marginBottom: '6pt',
                        textTransform: 'uppercase',
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '9.5pt', color: '#555555', letterSpacing: '0.3px', paddingBottom: '4pt' }}>
                    {basics.email && basics.email}
                    {basics.email && basics.phone && `  ·  `}
                    {basics.phone && basics.phone}
                    {(basics.email || basics.phone) && basics.address && `  ·  `}
                    {basics.address && basics.address}
                    {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && `  ·  `}
                    {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                        <span key={idx}>
                            {idx > 0 && `  ·  `}
                            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'underline' }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: `0.2in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in` }}>
                {sections.map((sectionKey: SectionKey) => {
                    const sectionHeaderStyle = {
                        fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                        fontWeight: '700' as const,
                        color: colorValue,
                        textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                        marginBottom: '8pt',
                        paddingBottom: '4pt',
                        borderBottom: `2pt solid ${colorValue}`,
                        letterSpacing: '1px',
                        breakInside: 'avoid' as const,
                    };

                    if (sectionKey === 'profile' && basics.summary) {
                        return (
                            <div key="profile" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Profile</h2>
                                <div style={{ fontSize: '10pt', color: '#333333', lineHeight: '1.5' }}>
                                    {basics.summary}
                                </div>
                            </div>
                        );
                    }

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <div key="education" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Education</h2>
                                {education.map((edu: Education, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight), fontSize: '11pt' }}>{edu.institution}</span>
                                            <span style={{ fontSize: '9pt', color: '#666666' }}>{edu.graduationDate}</span>
                                        </div>
                                        <div style={{ fontStyle: 'italic', fontSize: '10pt', color: '#444444' }}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </div>
                                        {formatting.showGPA && edu.gpa && <div style={{ fontSize: '9pt', color: '#666666', marginTop: '2pt' }}>GPA: {edu.gpa}</div>}
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (sectionKey === 'work' && work.length > 0) {
                        return (
                            <div key="work" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Experience</h2>
                                {work.map((job: WorkExperience, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight), fontSize: '11pt' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</span>
                                            <span style={{ fontSize: '9pt', color: '#666666' }}>{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}</span>
                                        </div>
                                        <div style={{ fontStyle: 'italic', fontSize: '10pt', color: '#444444', marginBottom: '4pt' }}>
                                            {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location && `, ${job.location}`}
                                        </div>
                                        {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '2pt', fontSize: '10pt', breakInside: 'avoid' }}>
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

                    if (sectionKey === 'skills' && skills.length > 0) {
                        return (
                            <div key="skills" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Skills</h2>
                                <div className="space-y-1">
                                    {skills.map((skillGroup: Skill, idx: number) => (
                                        <div key={idx} style={{ fontSize: '10pt', breakInside: 'avoid' }}>
                                            <span style={{ fontWeight: 'bold' }}>{skillGroup.category}: </span>
                                            {formatting.skillLayout === 'inline-tags' ? (
                                                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px' }}>
                                                    {skillGroup.items.map((item, i) => (
                                                        <span key={i} style={{ background: `${colorValue}15`, border: `1px solid ${colorValue}40`, padding: '1px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{item}</span>
                                                    ))}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#444444' }}>{skillGroup.items.join(getSkillSeparator(formatting.skillLayout))}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    if (sectionKey === 'projects' && projects.length > 0) {
                        return (
                            <div key="projects" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Projects</h2>
                                {projects.map((project: Project, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{project.name}</span>
                                                {project.url && (
                                                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '9pt', color: colorValue, textDecoration: 'underline' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </a>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '9pt', color: '#666666' }}>{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}</span>
                                        </div>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666', marginBottom: '2pt' }}>
                                                {project.keywords.join(', ')}
                                            </div>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '10pt', breakInside: 'avoid' }}>
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
                            <div key="awards" style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Awards</h2>
                                <div className="space-y-2">
                                    {awards.map((award: Award, idx: number) => (
                                        <div key={idx} style={{ fontSize: '10pt', breakInside: 'avoid' }}>
                                            <span style={{ fontWeight: 'bold' }}>{award.title}</span>
                                            {award.date && <span style={{ color: '#666666' }}> · {award.date}</span>}
                                            {award.awarder && <div style={{ fontStyle: 'italic', color: '#666666', fontSize: '9pt' }}>{award.awarder}</div>}
                                            {formatting.showAwardsSummaries && award.summary && <div style={{ fontSize: '9pt', color: '#555555', marginTop: '2pt' }}>{award.summary}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Custom sections
                    const customSection = customSections.find((cs: CustomSection) => cs.id === sectionKey);
                    if (customSection && customSection.items && customSection.items.length > 0) {
                        return (
                            <div key={customSection.id} style={{ marginBottom: '16pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>{customSection.title}</h2>
                                {customSection.items.map((entry, idx) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{entry.title}</span>
                                            <span style={{ fontSize: '9pt', color: '#666666' }}>{entry.date}</span>
                                        </div>
                                        {entry.subtitle && (
                                            <div style={{ fontStyle: 'italic', fontSize: '10pt', color: '#444444', marginBottom: '4pt' }}>
                                                {entry.subtitle}{entry.location && `, ${entry.location}`}
                                            </div>
                                        )}
                                        {customSection.type === 'bullets' ? (
                                            entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                                <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '2pt', fontSize: '10pt', breakInside: 'avoid' }}>
                                                            <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                            <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )
                                        ) : (
                                            entry.bullets && entry.bullets[0] && (
                                                <div style={{ fontSize: '10pt', color: '#333333', lineHeight: '1.5' }}>
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
