import { useResumeStore } from '../../store';
import { getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function AcademicTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting, customSections } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    return (
        <div
            className="bg-white text-left"
            style={{
                fontFamily: '"Times New Roman", Times, serif',  /* Academic template always uses serif */
                fontSize: formatting.baseFontSize,
                lineHeight: formatting.lineSpacing,
                padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                color: '#000000',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
            }}
        >
            {/* Academic Header — centered name, contact below */}
            <div style={{ textAlign: formatting.headerAlignment, marginBottom: '12pt' }}>
                <h1
                    style={{
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : 'normal',
                        color: colorValue,
                        marginBottom: '4pt',
                        fontVariant: 'small-caps',
                        letterSpacing: '1px',
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '9.5pt', color: '#444444', borderTop: `1px solid ${colorValue}`, borderBottom: `1px solid ${colorValue}`, padding: '4pt 0', display: 'inline-block' }}>
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

            {/* Sections */}
            {sections.map((sectionKey: SectionKey) => {
                const sectionHeaderStyle = {
                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                    fontWeight: (formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal') as any,
                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                    textDecoration: formatting.sectionTitleUnderline ? 'underline' as const : 'none' as const,
                    color: colorValue,
                    marginBottom: '6pt',
                    paddingBottom: '3pt',
                    borderBottom: `2px solid ${colorValue}`,
                    fontVariant: 'small-caps' as const,
                    letterSpacing: '1px',
                };

                if (sectionKey === 'profile' && basics.summary) {
                    return (
                        <div key="profile" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Research Interests</h2>
                            <div style={{ fontSize: '10pt', color: '#333333', lineHeight: '1.6' }}>
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
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid', paddingLeft: '12pt' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: 'bold' }}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                                        <span style={{ fontSize: '9pt', color: '#666666' }}>{edu.graduationDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#555555' }}>
                                        {edu.institution}{edu.location && `, ${edu.location}`}
                                    </div>
                                    {edu.gpa && <div style={{ fontSize: '9pt', color: '#777777' }}>GPA: {edu.gpa}</div>}
                                    {edu.description && <div style={{ fontSize: '9pt', color: '#555555', marginTop: '2pt' }}>{edu.description}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Professional Experience</h2>
                            {work.map((job: WorkExperience, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), paddingLeft: '12pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: 'bold' }}>{job.position}</span>
                                        <span style={{ fontSize: '9pt', color: '#666666' }}>{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
                                        {job.company}{job.location && `, ${job.location}`}
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

                if (sectionKey === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Technical Proficiencies</h2>
                            <div style={{ paddingLeft: '12pt' }} className="space-y-1">
                                {skills.map((skillGroup: Skill, idx: number) => (
                                    <div key={idx} style={{ fontSize: '9.5pt', breakInside: 'avoid' }}>
                                        <span style={{ fontWeight: 'bold' }}>{skillGroup.category}: </span>
                                        <span style={{ color: '#333333' }}>{skillGroup.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Selected Projects & Publications</h2>
                            {projects.map((project: Project, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), paddingLeft: '12pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <div className="flex items-center gap-2">
                                            <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '8.5pt', color: colorValue, textDecoration: 'none' }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '9pt', color: '#666666' }}>{project.startDate} — {project.endDate}</span>
                                    </div>
                                    {project.keywords && project.keywords.length > 0 && (
                                        <div style={{ fontSize: '8.5pt', color: '#999999', fontStyle: 'italic', marginBottom: '2pt' }}>
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

                if (sectionKey === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Honors & Awards</h2>
                            <div style={{ paddingLeft: '12pt' }} className="space-y-2">
                                {awards.map((award: Award, idx: number) => (
                                    <div key={idx} style={{ fontSize: '9.5pt', breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: 'bold' }}>{award.title}</span>
                                            {award.date && <span style={{ fontSize: '9pt', color: '#666666' }}>{award.date}</span>}
                                        </div>
                                        {award.awarder && <div style={{ fontStyle: 'italic', color: '#555555' }}>{award.awarder}</div>}
                                        {award.summary && <div style={{ fontSize: '9pt', color: '#666666', marginTop: '2pt' }}>{award.summary}</div>}
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
                        <div key={customSection.id} style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>{customSection.title}</h2>
                            {customSection.items.map((entry, idx) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), paddingLeft: '12pt', breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                                        <span style={{ fontSize: '9pt', color: '#666666' }}>{entry.date}</span>
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
                                            <div style={{ fontSize: '10pt', color: '#333333', lineHeight: '1.6' }}>
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
