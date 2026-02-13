import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize, getSubHeaderWeight, getSkillSeparator, getDateSeparatorChar } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

export function ElegantTemplate() {
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
                display: 'flex',
            }}
        >
            {/* Left Accent Stripe */}
            <div
                style={{
                    width: '6px',
                    backgroundColor: colorValue,
                    flexShrink: 0,
                }}
            />

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                }}
            >
                {/* Header */}
                <div style={{ textAlign: formatting.headerAlignment, marginBottom: '16pt', paddingBottom: '12pt', borderBottom: `2px solid ${colorValue}20` }}>
                    <h1
                        style={{
                            fontSize: getNameSize(formatting.nameSize),
                            fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : 'normal',
                            color: colorValue,
                            letterSpacing: '2px',
                            marginBottom: '6pt',
                        }}
                    >
                        {basics.name || 'Your Name'}
                    </h1>
                    <div style={{ fontSize: '9.5pt', color: '#666666', letterSpacing: '0.5px' }}>
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
                        fontWeight: (formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : formatting.fontWeightSectionTitle === 'MEDIUM' ? '500' : 'normal') as any,
                        textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle) as any,
                        textDecoration: formatting.sectionTitleUnderline ? 'underline' as const : 'none' as const,
                        color: colorValue,
                        marginBottom: '8pt',
                        letterSpacing: '1.5px',
                        borderBottom: formatting.sectionDividers !== 'none' ? `1px solid ${colorValue}40` : 'none',
                        paddingBottom: '4pt',
                    };

                    if (sectionKey === 'profile' && basics.summary) {
                        return (
                            <div key="profile" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Profile</h2>
                                <div style={{ fontSize: '10pt', color: '#444444', lineHeight: '1.6', fontStyle: 'italic' }}>
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
                                            <span style={{ fontSize: '9pt', color: '#888888', fontStyle: 'italic' }}>{edu.graduationDate}</span>
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
                                <h2 style={sectionHeaderStyle}>Experience</h2>
                                {work.map((job: WorkExperience, idx: number) => (
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: getSubHeaderWeight(formatting.subHeaderWeight) }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</span>
                                            <span style={{ fontSize: '9pt', color: '#888888', fontStyle: 'italic' }}>{job.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{job.endDate}</span>
                                        </div>
                                        <div style={{ fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
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

                    if (sectionKey === 'skills' && skills.length > 0) {
                        return (
                            <div key="skills" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Skills</h2>
                                <div className="space-y-1">
                                    {skills.map((skillGroup: Skill, idx: number) => (
                                        <div key={idx} style={{ fontSize: '9.5pt', breakInside: 'avoid' }}>
                                            <span style={{ fontWeight: 'bold', color: '#333333' }}>{skillGroup.category}: </span>
                                            {formatting.skillLayout === 'inline-tags' ? (
                                                <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '2px' }}>
                                                    {skillGroup.items.map((item, i) => (
                                                        <span key={i} style={{ background: `${colorValue}12`, border: `1px solid ${colorValue}30`, padding: '1px 6px', borderRadius: '3px', fontSize: '0.85em' }}>{item}</span>
                                                    ))}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#555555' }}>{skillGroup.items.join(getSkillSeparator(formatting.skillLayout))}</span>
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
                                            <span style={{ fontSize: '9pt', color: '#888888', fontStyle: 'italic' }}>{project.startDate}{getDateSeparatorChar(formatting.dateSeparator)}{project.endDate}</span>
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

                    if (sectionKey === 'awards' && awards.length > 0) {
                        return (
                            <div key="awards" style={{ marginBottom: '14pt', breakInside: 'avoid-page' }}>
                                <h2 style={sectionHeaderStyle}>Awards</h2>
                                <div className="space-y-2">
                                    {awards.map((award: Award, idx: number) => (
                                        <div key={idx} style={{ fontSize: '9.5pt', breakInside: 'avoid' }}>
                                            <div style={{ fontWeight: 'bold' }}>{award.title} {award.date && <span style={{ fontWeight: 'normal', color: '#888888', fontStyle: 'italic' }}>• {award.date}</span>}</div>
                                            {award.awarder && <div style={{ color: '#666666', fontStyle: 'italic' }}>{award.awarder}</div>}
                                            {formatting.showAwardsSummaries && award.summary && <div style={{ fontSize: '9pt', color: '#777777', marginTop: '2pt' }}>{award.summary}</div>}
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
                                    <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                        <div className="flex justify-between items-baseline">
                                            <span style={{ fontWeight: 'bold' }}>{entry.title}</span>
                                            <span style={{ fontSize: '9pt', color: '#888888', fontStyle: 'italic' }}>{entry.date}</span>
                                        </div>
                                        {entry.subtitle && (
                                            <div style={{ fontSize: '9.5pt', color: '#555555', marginBottom: '3pt' }}>
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
                                                <div style={{ fontSize: '10pt', color: '#444444', lineHeight: '1.6', fontStyle: 'italic' }}>
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
