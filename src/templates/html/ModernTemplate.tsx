import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize } from '../../lib/formatting';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award } from '../../types';

export function ModernTemplate() {
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
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div className="pb-4 border-b-4" style={{ marginBottom: '12pt', borderColor: colorValue, textAlign: formatting.headerAlignment }}>
                <h1
                    className="mb-2 uppercase tracking-wider"
                    style={{
                        color: colorValue,
                        fontSize: getNameSize(formatting.nameSize),
                        fontWeight: formatting.fontWeightName === 'BOLD' || formatting.fontWeightName === 'HEAVY' ? 'bold' : 'normal'
                    }}
                >
                    {basics.name || 'Your Name'}
                </h1>
                <div className={`text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 ${formatting.headerAlignment === 'center' ? 'justify-center' : formatting.headerAlignment === 'right' ? 'justify-end' : ''}`}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span className="text-slate-300">{formatting.separator}</span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span className="text-slate-300">{formatting.separator}</span>}
                    {basics.address && <span>{basics.address}</span>}
                </div>
                {basics.websites.length > 0 && (
                    <div className={`text-sm mt-2 flex flex-wrap gap-x-4 gap-y-1 ${formatting.headerAlignment === 'center' ? 'justify-center' : formatting.headerAlignment === 'right' ? 'justify-end' : ''}`}>
                        {basics.websites.map((site: { name?: string; url: string }, idx: number) => (
                            <a key={idx} href={site.url} target="_blank" rel="noopener noreferrer" className="no-underline font-medium" style={{ color: colorValue }}>
                                {site.name || site.url}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections */}
            {sections.map((sectionKey: SectionKey) => {
                if (sectionKey === 'profile') return null;

                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" className="mb-6" style={{ breakInside: 'avoid-page' }}>
                            <h2
                                className="font-bold mb-3 pl-3 border-l-8"
                                style={{
                                    borderColor: colorValue,
                                    color: colorValue,
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
                                <div key={idx} style={{ marginBottom: getEntrySpacingValue(formatting.entrySpacing), breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span className="text-lg">{edu.institution}</span>
                                        <span className="text-xs font-normal text-slate-500">{edu.graduationDate}</span>
                                    </div>
                                    <div className="italic text-slate-700">
                                        {edu.degree}{edu.field && ` in ${edu.field}`}
                                    </div>
                                    {edu.gpa && <div className="text-sm mt-1 font-semibold">GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" className="mb-6" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider" style={{ color: colorValue, borderLeftColor: colorValue, breakInside: 'avoid' }}>
                                Experience
                            </h2>
                            {work.map((job: WorkExperience, idx: number) => (
                                <div key={idx} className="mb-5 pl-3" style={{ breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold text-lg">
                                        <span>{job.company}</span>
                                        <span className="text-sm font-normal text-slate-500">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="italic text-slate-700 mb-2">
                                        {job.position}{job.location && `, ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.filter((b: string) => b.trim() !== '').map((line: string, i: number) => (
                                                <li key={i} className="flex items-start mb-0.5" style={{ gap: getBulletGapValue(formatting.bulletGap), breakInside: 'avoid' }}>
                                                    <span className="mt-0.5 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    {line.replace(/^[•*-]\s*/, '')}
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
                        <div key="skills" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue, breakInside: 'avoid' }}>
                                Skills
                            </h2>
                            <div className="pl-3 space-y-1 text-left">
                                {skills.map((skillGroup: Skill, idx: number) => (
                                    <div key={idx} className="text-sm text-left" style={{ breakInside: 'avoid' }}>
                                        <span className="font-bold">{skillGroup.category}: </span>
                                        <span className="text-slate-700">{skillGroup.items.join(', ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue, breakInside: 'avoid' }}>
                                Projects
                            </h2>
                            {projects.map((project: Project, idx: number) => (
                                <div key={idx} className="mb-4 pl-3 text-left" style={{ breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline font-bold text-lg">
                                        <div className="flex items-center gap-2">
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm font-normal underline" style={{ color: colorValue }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-sm font-normal text-slate-500 whitespace-nowrap ml-4">{project.startDate} — {project.endDate}</span>
                                    </div>
                                    <div className="text-sm italic text-slate-600 mb-2">
                                        {project.keywords.join(' • ')}
                                    </div>
                                    {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none space-y-1" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.filter((b: string) => b.trim() !== '').map((bullet: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm items-start text-left" style={{ breakInside: 'avoid' }}>
                                                    <span className="mt-1 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    <span className="text-slate-700">{bullet.replace(/^[•*-]\s*/, '')}</span>
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
                        <div key="awards" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue, breakInside: 'avoid' }}>
                                Awards
                            </h2>
                            <div className="pl-3 space-y-2 text-left">
                                {awards.map((award: Award, idx: number) => (
                                    <div key={idx} className="text-sm text-left" style={{ breakInside: 'avoid' }}>
                                        <div className="font-bold text-left">{award.title} {award.date && <span className="font-normal opacity-60 ml-1">— {award.date}</span>}</div>
                                        {award.awarder && <div className="italic text-slate-600 text-left">{award.awarder}</div>}
                                        {award.summary && <div className="text-xs mt-1 text-slate-500 text-left">{award.summary}</div>}
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
