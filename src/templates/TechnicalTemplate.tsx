import { useResumeStore } from '../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue } from '../utils/formatting';

export function TechnicalTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    return (
        <div
            className="bg-white text-black"
            style={{
                fontFamily: getFontFamilyCSS(formatting.fontFamily),
                fontSize: formatting.baseFontSize,
                lineHeight: formatting.lineSpacing,
                padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
                width: '8.5in',
                minHeight: '11in',
                height: 'auto',
                boxSizing: 'border-box'
            }}
        >
            {/* Header */}
            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold uppercase mb-2 tracking-tighter" style={{ color: colorValue }}>
                    {basics.name || 'Your Name'}
                </h1>
                <div className="text-sm flex flex-wrap gap-y-1 justify-center">
                    {[
                        basics.email,
                        basics.phone,
                        basics.address,
                        ...basics.websites.map(w => w.name)
                    ].filter(Boolean).map((item, idx, arr) => (
                        <span key={idx} className="flex items-center">
                            {item}
                            {idx < arr.length - 1 && <span className="mx-2 opacity-50">{formatting.separator}</span>}
                        </span>
                    ))}
                </div>
            </div>

            <div className="h-0.5 bg-black mb-6" style={{ backgroundColor: colorValue }} />

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
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span>{job.company}</span>
                                        <span className="text-sm">{job.startDate} — {job.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline italic text-sm mb-1">
                                        <span>{job.position}</span>
                                        <span>{job.location}</span>
                                    </div>
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
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span>{edu.institution}</span>
                                        <span className="text-sm font-normal">{edu.graduationDate}</span>
                                    </div>
                                    <div className="text-sm italic">
                                        {edu.degree} in {edu.field} {edu.gpa && `• GPA: ${edu.gpa}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest text-left" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Skills
                            </h2>
                            <div className="grid grid-cols-1 gap-1 text-left">
                                {skills.map((skill, idx) => (
                                    <div key={idx} className="text-sm text-left" style={{ breakInside: 'avoid' }}>
                                        <span className="font-bold">{skill.category}:</span> {skill.items.join(', ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" className="mb-6 text-left" style={{ breakInside: 'avoid-page' }}>
                            <h2 className="text-left text-lg font-bold border-y-2 border-black py-1 mb-3 uppercase tracking-widest text-left" style={{ borderColor: colorValue, breakInside: 'avoid' }}>
                                Projects
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-4" style={{ breakInside: 'avoid' }}>
                                    <div className="font-bold flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs font-normal text-indigo-600 hover:underline">
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-xs font-normal opacity-70">{project.startDate} — {project.endDate}</span>
                                    </div>
                                    {project.keywords.length > 0 && (
                                        <div className="text-xs italic opacity-80 mb-1">
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
                                <div key={idx} className="text-sm mb-1 text-left" style={{ breakInside: 'avoid' }}>
                                    <span className="font-bold">{award.title}</span> — {award.awarder} ({award.date})
                                    {award.summary && <div className="text-xs opacity-80 italic text-left">{award.summary}</div>}
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
