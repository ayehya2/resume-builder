import { useResumeStore } from '../../store';
import { getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize, getSubHeaderWeight, getSkillSeparator } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function AcademicTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting, customSections } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);
    const entrySpacing = getEntrySpacingValue(formatting.entrySpacing);

    // 2-column layout widths matching PDF (22% date | 78% content)
    const dateColumnStyle: React.CSSProperties = {
        width: '22%',
        paddingRight: '10px',
        flexShrink: 0,
    };
    const contentColumnStyle: React.CSSProperties = {
        width: '78%',
    };

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
                        color: '#1a1a1a',
                        marginBottom: '4pt',
                        fontVariant: 'small-caps',
                        letterSpacing: '1px',
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '9pt', color: '#555555' }}>
                    {basics.email && basics.email}
                    {basics.email && basics.phone && '  ·  '}
                    {basics.phone && basics.phone}
                    {(basics.email || basics.phone) && basics.address && '  ·  '}
                    {basics.address && basics.address}
                    {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && '  ·  '}
                    {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                        <span key={idx}>
                            {idx > 0 && '  ·  '}
                            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'underline' }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
            </div>

            {/* Accent divider matching PDF */}
            <div style={{ width: '100%', height: '2px', backgroundColor: colorValue, marginBottom: '12pt' }} />

            {/* Sections */}
            {sections.map((sectionKey: SectionKey) => {
                const sectionHeaderStyle: React.CSSProperties = {
                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                    fontWeight: (formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal') as any,
                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                    textDecoration: formatting.sectionTitleUnderline ? 'underline' as const : 'none' as const,
                    color: '#1a1a1a',
                    marginBottom: '6pt',
                    paddingBottom: '3pt',
                    borderBottom: `1.5pt solid ${colorValue}`,
                    letterSpacing: '1px',
                };

                if (sectionKey === 'profile' && basics.summary) {
                    return (
                        <div key="profile" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Research Interests</h2>
                            <div style={{ fontSize: '10pt', color: '#333333', lineHeight: '1.5' }}>
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
                                <div key={idx} style={{ marginBottom: entrySpacing, breakInside: 'avoid', display: 'flex' }}>
                                    <div style={dateColumnStyle}>
                                        <span style={{ fontSize: '9pt', color: '#666666' }}>{edu.graduationDate}</span>
                                    </div>
                                    <div style={contentColumnStyle}>
                                        <div style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>{edu.institution}</div>
                                        <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#444444' }}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </div>
                                        {formatting.showGPA && edu.gpa && <div style={{ fontSize: '9pt', color: '#666666' }}>GPA: {edu.gpa}</div>}
                                        {edu.description && <div style={{ fontSize: '9pt', color: '#555555', marginTop: '2pt' }}>{edu.description}</div>}
                                    </div>
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
                                <div key={idx} style={{ marginBottom: entrySpacing, breakInside: 'avoid', display: 'flex' }}>
                                    <div style={dateColumnStyle}>
                                        <div style={{ fontSize: '9pt', color: '#666666' }}>{job.startDate} –</div>
                                        <div style={{ fontSize: '9pt', color: '#666666' }}>{job.endDate}</div>
                                    </div>
                                    <div style={contentColumnStyle}>
                                        <div style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>
                                            {formatting.companyTitleOrder === 'company-first' ? job.company : job.position}
                                        </div>
                                        <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#444444', marginBottom: '3pt' }}>
                                            {formatting.companyTitleOrder === 'company-first' ? job.position : job.company}{formatting.showLocation && job.location && `, ${job.location}`}
                                        </div>
                                        {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                        <span className="mt-0.5 flex-shrink-0" style={{ color: '#555555' }}>{bulletSymbol}</span>
                                                        <span>{parseBoldText(line.replace(/^[•*-]\s*/, ''))}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Technical Proficiencies</h2>
                            <div className="space-y-1">
                                {skills.map((skillGroup: Skill, idx: number) => (
                                    <div key={idx} style={{ fontSize: '9.5pt', breakInside: 'avoid' }}>
                                        <span style={{ fontWeight: 'bold' }}>{skillGroup.category}: </span>
                                        {formatting.skillLayout === 'inline-tags' ? (
                                            <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px' }}>
                                                {skillGroup.items.map((item, i) => (
                                                    <span key={i} style={{ background: `${colorValue}12`, border: `1px solid ${colorValue}30`, padding: '1px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{item}</span>
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
                        <div key="projects" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Selected Projects & Publications</h2>
                            {projects.map((project: Project, idx: number) => (
                                <div key={idx} style={{ marginBottom: entrySpacing, breakInside: 'avoid', display: 'flex' }}>
                                    <div style={dateColumnStyle}>
                                        <div style={{ fontSize: '9pt', color: '#666666' }}>{project.startDate} –</div>
                                        <div style={{ fontSize: '9pt', color: '#666666' }}>{project.endDate}</div>
                                    </div>
                                    <div style={contentColumnStyle}>
                                        <div>
                                            <span style={{ fontWeight: 'bold' }}>{project.name}</span>
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '6px', fontSize: '8.5pt', color: colorValue, textDecoration: 'underline' }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <div style={{ fontSize: '8.5pt', fontStyle: 'italic', color: '#777777', marginBottom: '2pt' }}>
                                                {project.keywords.join(', ')}
                                            </div>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                            <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                    <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                        <span className="mt-0.5 flex-shrink-0" style={{ color: '#555555' }}>{bulletSymbol}</span>
                                                        <span>{parseBoldText(bullet.replace(/^[•*-]\s*/, ''))}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                            <h2 style={sectionHeaderStyle}>Honors & Awards</h2>
                            {awards.map((award: Award, idx: number) => (
                                <div key={idx} style={{ marginBottom: entrySpacing, breakInside: 'avoid', display: 'flex' }}>
                                    <div style={dateColumnStyle}>
                                        {award.date && <span style={{ fontSize: '9pt', color: '#666666' }}>{award.date}</span>}
                                    </div>
                                    <div style={contentColumnStyle}>
                                        <span style={{ fontSize: '10pt', fontWeight: 'bold' }}>{award.title}</span>
                                        {award.awarder && <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#666666' }}>{award.awarder}</div>}
                                        {formatting.showAwardsSummaries && award.summary && <div style={{ fontSize: '9pt', color: '#555555', marginTop: '1pt' }}>{award.summary}</div>}
                                    </div>
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
                                <div key={idx} style={{ marginBottom: entrySpacing, breakInside: 'avoid', display: 'flex' }}>
                                    <div style={dateColumnStyle}>
                                        {entry.date && <div style={{ fontSize: '9pt', color: '#666666' }}>{entry.date}</div>}
                                        {entry.location && <div style={{ fontSize: '8pt', color: '#777777' }}>{entry.location}</div>}
                                    </div>
                                    <div style={contentColumnStyle}>
                                        <div style={{ fontWeight: 'bold' }}>{entry.title || 'Untitled'}</div>
                                        {entry.subtitle && (
                                            <div style={{ fontStyle: 'italic', fontSize: '9.5pt', color: '#444444', marginBottom: '3pt' }}>
                                                {entry.subtitle}
                                            </div>
                                        )}
                                        {customSection.type === 'bullets' ? (
                                            entry.bullets && entry.bullets.filter(b => b.trim()).length > 0 && (
                                                <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), marginBottom: '1pt', fontSize: '9.5pt', breakInside: 'avoid' }}>
                                                            <span className="mt-0.5 flex-shrink-0" style={{ color: '#555555' }}>{bulletSymbol}</span>
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
