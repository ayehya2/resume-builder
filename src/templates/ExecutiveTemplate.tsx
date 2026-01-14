import { useResumeStore } from '../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue } from '../utils/formatting';

export function ExecutiveTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    return (
        <div
            className="bg-white"
            style={{
                fontFamily: getFontFamilyCSS(formatting.fontFamily),
                fontSize: formatting.baseFontSize,
                lineHeight: formatting.lineSpacing,
                padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                color: '#000000'
            }}
        >
            {/* Header */}
            <div className="text-center mb-8 pb-4 border-b-2 border-black" style={{ borderBottomColor: colorValue }}>
                <h1 className="text-4xl font-bold mb-3 uppercase tracking-widest" style={{ color: colorValue }}>
                    {basics.name || 'YOUR NAME'}
                </h1>
                <div className="text-sm font-medium flex justify-center flex-wrap gap-y-1">
                    {[
                        basics.email,
                        basics.phone,
                        basics.address
                    ].filter(Boolean).map((item, idx, arr) => (
                        <span key={idx} className="flex items-center">
                            {item}
                            {idx < arr.length - 1 && <span className="mx-3 font-bold opacity-40">{formatting.separator}</span>}
                        </span>
                    ))}
                </div>
                {basics.websites.length > 0 && (
                    <div className="text-sm mt-1 flex justify-center flex-wrap gap-y-1">
                        {basics.websites.map((w, i) => (
                            <span key={i} className="flex items-center">
                                {i > 0 && <span className="mx-3 font-bold opacity-40">{formatting.separator}</span>}
                                {w.url ? (
                                    <a href={w.url} target="_blank" rel="noopener noreferrer" className="hover:underline font-bold" style={{ color: colorValue }}>
                                        {w.name}
                                    </a>
                                ) : (
                                    <span className="font-bold" style={{ color: colorValue }}>{w.name}</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections */}
            {sections.map((sectionKey) => {
                if (sectionKey === 'profile') return null;

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Professional Experience
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} className="mb-5 text-left">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-lg uppercase tracking-tight">{job.company}</span>
                                        <span className="text-sm font-semibold whitespace-nowrap ml-4">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-2 italic text-slate-700">
                                        <span>{job.position}</span>
                                        <span className="text-sm">{job.location}</span>
                                    </div>
                                    {job.bullets && job.bullets.length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.map((line: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-1.5 leading-relaxed text-left">
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

                if (section === 'education' && education.length > 0) {
                    return (
                        <div key="education" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} className="mb-4">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-lg">{edu.institution}</div>
                                        <div className="text-sm font-semibold">{edu.graduationDate}</div>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="italic font-medium text-slate-800">{edu.degree} in {edu.field}</div>
                                        <div className="text-sm opacity-80">{edu.location}</div>
                                    </div>
                                    {edu.gpa && <div className="text-sm font-semibold">GPA: {edu.gpa}</div>}
                                    {edu.description && <div className="text-sm mt-1 opacity-90 leading-relaxed text-left">{edu.description}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Technical Skills
                            </h2>
                            <div className="grid grid-cols-1 gap-2 pl-1">
                                {skills.map((skill, idx) => (
                                    <div key={idx} className="text-sm text-left">
                                        <span className="font-bold uppercase text-[9pt] tracking-widest text-slate-600 mr-3 inline-block w-24">{skill.category}</span>
                                        <span className="text-slate-800 font-medium">{skill.items.join('  •  ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (section === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Key Projects
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-4 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold uppercase tracking-tight">{project.name}</span>
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs font-normal hover:underline" style={{ color: colorValue }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold whitespace-nowrap ml-4">{project.startDate} — {project.endDate}</span>
                                    </div>
                                    {project.keywords.length > 0 && (
                                        <div className="text-xs italic opacity-70 mb-2 text-left">
                                            Technologies: {project.keywords.join(', ')}
                                        </div>
                                    )}
                                    {project.bullets && project.bullets.length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.map((line: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-1.5 leading-relaxed text-left">
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

                if (section === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Honors & Awards
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} className="mb-4 text-sm text-left">
                                    <div className="font-bold uppercase tracking-tight leading-tight text-left">
                                        {award.title} {award.date && <span className="font-normal normal-case opacity-60 ml-2">({award.date})</span>}
                                    </div>
                                    <div className="italic opacity-80 text-left">{award.awarder}</div>
                                    {award.summary && <div className="mt-1 text-slate-600 text-left">{award.summary}</div>}
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
