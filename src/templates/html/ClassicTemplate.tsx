import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize } from '../../lib/formatting';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award } from '../../types';

export function ClassicTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

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
                color: '#000000',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff', // Force white background for PDF preview
            }}
        >
            {/* Header */}
            <div className="mb-4" style={{ textAlign: formatting.headerAlignment }}>
                <h1
                    className="mb-2"
                    style={{
                        color: colorValue,
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : 'normal'
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div className="text-sm">
                    {basics.email && basics.email}
                    {basics.email && basics.phone && ` ${formatting.separator} `}
                    {basics.phone && basics.phone}
                    {(basics.email || basics.phone) && basics.address && ` ${formatting.separator} `}
                    {basics.address && basics.address}

                    {/* Website Links Merged Inline */}
                    {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && ` ${formatting.separator} `}
                    {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                        <span key={idx}>
                            {idx > 0 && ` ${formatting.separator} `}
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: colorValue }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
            </div>

            {/* Sections */}
            {sections.map((sectionKey: SectionKey) => {
                if (sectionKey === 'profile') return null;

                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" className="mb-5 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="font-bold mb-3 pb-1"
                                style={{
                                    borderBottom: formatting.sectionDividers !== 'none' ? `1.5pt solid ${colorValue}` : 'none',
                                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
                                    textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                    fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
                                    breakInside: 'avoid'
                                }}
                            >
                                Education
                            </h2>
                            {education.map((edu: Education, idx: number) => (
                                <div key={idx} className="mb-3" style={{ breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span>{edu.institution}</span>
                                        <span className="text-xs font-normal">{edu.graduationDate}</span>
                                    </div>
                                    <div className="italic text-sm">
                                        {edu.degree}{edu.field && ` in ${edu.field}`}
                                    </div>
                                    {edu.gpa && <div className="text-xs mt-1">GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" className="mb-5 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="text-sm font-bold mb-3 uppercase pb-1"
                                style={{
                                    borderBottom: `1.5pt solid ${colorValue}`,
                                    breakInside: 'avoid'
                                }}
                            >
                                Experience
                            </h2>
                            {work.map((job: WorkExperience, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span>{job.company}</span>
                                        <span className="text-xs font-normal">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="italic text-sm mb-1">
                                        {job.position}{job.location && `, ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none text-sm" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                <li key={i} className="flex items-start mb-0.5" style={{ gap: getBulletGapValue(formatting.bulletGap), breakInside: 'avoid' }}>
                                                    <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    <span>{line.replace(/^[•*-]\s*/, '')}</span>
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
                        <div key="skills" className="mb-5 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="font-bold mb-3 pb-1"
                                style={{
                                    borderBottom: formatting.sectionDividers !== 'none' ? `1.5pt solid ${colorValue}` : 'none',
                                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
                                    textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                    fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
                                    breakInside: 'avoid'
                                }}
                            >
                                Skills
                            </h2>
                            <div className="space-y-1">
                                {skills.map((skillGroup: Skill, idx: number) => (
                                    <div key={idx} className="text-sm" style={{ breakInside: 'avoid' }}>
                                        <span className="font-bold">{skillGroup.category}: </span>
                                        <span>{skillGroup.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" className="mb-5 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="font-bold mb-3 pb-1"
                                style={{
                                    borderBottom: formatting.sectionDividers !== 'none' ? `1.5pt solid ${colorValue}` : 'none',
                                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
                                    textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                    fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
                                    breakInside: 'avoid'
                                }}
                            >
                                Projects
                            </h2>
                            {projects.map((project: Project, idx: number) => (
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold">
                                        <div className="flex items-center gap-2">
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs font-normal underline" style={{ color: colorValue }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-xs font-normal whitespace-nowrap ml-4">{project.startDate} — {project.endDate}</span>
                                    </div>
                                    <div className="text-xs italic mb-1">
                                        {project.keywords.join(', ')}
                                    </div>
                                    {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none text-sm" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                <li key={i} className="flex items-start" style={{ gap: getBulletGapValue(formatting.bulletGap), breakInside: 'avoid' }}>
                                                    <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    <span>{bullet.replace(/^[•*-]\s*/, '')}</span>
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
                        <div key="awards" className="mb-5 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="font-bold mb-3 pb-1"
                                style={{
                                    borderBottom: formatting.sectionDividers !== 'none' ? `1.5pt solid ${colorValue}` : 'none',
                                    fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                    textTransform: getSectionHeaderCase(formatting.sectionHeaderStyle),
                                    textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                    fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
                                    breakInside: 'avoid'
                                }}
                            >
                                Awards
                            </h2>
                            <div className="space-y-2">
                                {awards.map((award: Award, idx: number) => (
                                    <div key={idx} className="text-sm" style={{ breakInside: 'avoid' }}>
                                        <div className="font-bold">{award.title} {award.date && <span className="font-normal opacity-60">• {award.date}</span>}</div>
                                        {award.awarder && <div className="italic">{award.awarder}</div>}
                                        {award.summary && <div className="text-xs mt-1">{award.summary}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}
