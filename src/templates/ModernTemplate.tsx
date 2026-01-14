import { useResumeStore } from '../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue } from '../utils/formatting';

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
                textAlign: 'left',
                width: '8.5in',
                height: '11in',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div className="mb-6 pb-4 border-b-4 text-left" style={{ borderColor: colorValue }}>
                <h1 className="text-4xl font-black mb-2 uppercase tracking-tight text-left" style={{ color: colorValue }}>
                    {basics.name || 'Your Name'}
                </h1>
                <div className="text-sm font-medium text-slate-600 flex flex-wrap gap-y-1 justify-start">
                    {[
                        basics.email,
                        basics.phone,
                        basics.address
                    ].filter(Boolean).map((item, idx, arr) => (
                        <span key={idx} className="flex items-center">
                            {item}
                            {idx < arr.length - 1 && <span className="mx-2 opacity-50">{formatting.separator}</span>}
                        </span>
                    ))}
                </div>
                {basics.websites.length > 0 && (
                    <div className="text-sm mt-1 flex flex-wrap gap-y-1 justify-start">
                        {basics.websites.map((site, idx) => (
                            <span key={idx} className="flex items-center">
                                {idx > 0 && <span className="mx-2 opacity-50">{formatting.separator}</span>}
                                <a href={site.url} target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: colorValue }}>
                                    {site.name || site.url}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections */}
            {sections.map((sectionKey) => {
                if (sectionKey === 'profile') return null;

                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" className="mb-6">
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider" style={{ color: colorValue, borderLeftColor: colorValue }}>
                                Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} className="mb-4 pl-3">
                                    <div className="flex justify-between items-baseline font-bold text-lg">
                                        <span>{edu.institution}</span>
                                        <span className="text-sm font-normal text-slate-500">{edu.graduationDate}</span>
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
                        <div key="work" className="mb-6">
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider" style={{ color: colorValue, borderLeftColor: colorValue }}>
                                Experience
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} className="mb-5 pl-3">
                                    <div className="flex justify-between items-baseline font-bold text-lg">
                                        <span>{job.company}</span>
                                        <span className="text-sm font-normal text-slate-500">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="italic text-slate-700 mb-2">
                                        {job.position}{job.location && `, ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.map((line: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-1">
                                                    <span className="mt-1 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
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
                        <div key="skills" className="mb-6 text-left">
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue }}>
                                Skills
                            </h2>
                            <div className="pl-3 space-y-1 text-left">
                                {skills.map((skillGroup, idx) => (
                                    <div key={idx} className="text-sm text-left">
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
                        <div key="projects" className="mb-6 text-left">
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue }}>
                                Projects
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-4 pl-3 text-left">
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
                                    {project.bullets && project.bullets.length > 0 && (
                                        <ul className="list-none space-y-1" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.map((bullet, i) => (
                                                <li key={i} className="flex gap-2 text-sm items-start text-left">
                                                    <span className="mt-1 flex-shrink-0" style={{ color: colorValue }}>{bulletSymbol}</span>
                                                    <span className="text-slate-700">{bullet.replace(/^[•\-\*]\s*/, '')}</span>
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
                        <div key="awards" className="mb-6 text-left">
                            <h2 className="text-xl font-black mb-3 border-l-8 pl-3 uppercase tracking-wider text-left" style={{ color: colorValue, borderLeftColor: colorValue }}>
                                Awards
                            </h2>
                            <div className="pl-3 space-y-2 text-left">
                                {awards.map((award, idx) => (
                                    <div key={idx} className="text-sm text-left">
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
