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
                color: '#000000',
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box'
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
                        <div key="work" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Professional Experience
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} className="mb-4" style={{ breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <div className="font-bold text-lg text-left">{job.company}</div>
                                        <span className="text-sm font-normal opacity-70 whitespace-nowrap ml-4">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="italic text-slate-700 mb-2 text-left">{job.position} {job.location && <span> | {job.location}</span>}</div>
                                    {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.filter(b => b.trim() !== '').map((line, i) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-0.5" style={{ breakInside: 'avoid' }}>
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

                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} className="mb-2" style={{ breakInside: 'avoid' }}>
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-left">{edu.institution}</div>
                                        <span className="text-sm font-normal opacity-70 ml-4">{edu.graduationDate}</span>
                                    </div>
                                    <div className="text-sm text-left">{edu.degree} in {edu.field}</div>
                                    {edu.gpa && <div className="text-xs italic text-slate-600 text-left">GPA: {edu.gpa}</div>}
                                    {edu.description && <div className="text-sm mt-1 opacity-90 leading-relaxed text-left">{edu.description}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" className="mb-6 text-left">
                            <h2 className="text-left text-lg font-bold mb-3 pb-1 border-b border-black uppercase tracking-wider" style={{ borderBottomColor: colorValue }}>
                                Technical Skills
                            </h2>
                            <div className="grid grid-cols-1 gap-2 pl-1">
                                {skills.map((skill, idx) => (
                                    <div key={idx} className="text-sm text-left" style={{ breakInside: 'avoid' }}>
                                        <span className="font-bold uppercase text-[9pt] tracking-widest text-slate-600 mr-3 inline-block w-24">{skill.category}</span>
                                        <span className="text-slate-800 font-medium">{skill.items.join('  •  ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Key Projects
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-4" style={{ breakInside: 'avoid' }}>
                                    <div className="font-bold flex justify-between items-center text-left">
                                        <div className="flex items-center gap-2 text-left">
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs font-normal text-indigo-600 hover:underline">
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-xs font-normal opacity-70 whitespace-nowrap ml-4">{project.startDate} — {project.endDate}</span>
                                    </div>
                                    {project.keywords.length > 0 && (
                                        <div className="text-xs italic text-slate-600 mb-1 text-left">
                                            Technologies: {project.keywords.join(', ')}
                                        </div>
                                    )}
                                    {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.filter(b => b.trim() !== '').map((line, i) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-0.5" style={{ breakInside: 'avoid' }}>
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

                if (sectionKey === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest text-left" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Honors & Awards
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} className="text-sm mb-1" style={{ breakInside: 'avoid' }}>
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
