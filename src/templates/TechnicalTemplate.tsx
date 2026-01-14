import { useResumeStore } from '../store';

export function TechnicalTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections } = resumeData;

    return (
        <div className="bg-white p-6 font-sans text-slate-900" style={{ fontSize: '10pt', lineHeight: '1.3' }}>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-4xl font-light mb-1">
                    {basics.name || 'Your Name'}
                </h1>
                <div className="text-xs text-slate-600">
                    {[basics.email, basics.phone, basics.address, ...basics.websites.map(w => w.url ? `${w.name}: ${w.url}` : w.name)]
                        .filter(Boolean)
                        .join(' • ')}
                </div>
            </div>

            <div className="border-t border-slate-300 mb-4" />

            {/* Sections */}
            {sections.map((section) => {
                if (section === 'profile') return null;

                if (section === 'work' && work.length > 0) {
                    return (
                        <div key={section} className="mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                                Experience
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold">{job.company}</span>
                                        <span className="text-xs text-slate-600">{job.startDate} - {job.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline text-slate-700">
                                        <span className="italic">{job.position}</span>
                                        <span className="text-xs">{job.location}</span>
                                    </div>
                                    {job.bullets && job.bullets.length > 0 && (
                                        <div className="mt-1 text-xs text-slate-800">
                                            {job.bullets.map((line: string, i: number) => (
                                                <div key={i}>• {line.replace(/^[•\-\*]\s*/, '')}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'education' && education.length > 0) {
                    return (
                        <div key={section} className="mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                                Education
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} className="mb-2">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{edu.institution}</span>
                                        <span className="text-xs text-slate-600">{edu.graduationDate}</span>
                                    </div>
                                    <div className="text-slate-700 italic text-sm">
                                        {edu.degree} in {edu.field} {edu.gpa && `• GPA: ${edu.gpa}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'skills' && skills.length > 0) {
                    return (
                        <div key={section} className="mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                                Skills
                            </h2>
                            {skills.map((skill, idx) => (
                                <div key={idx} className="mb-1 text-xs">
                                    <span className="font-semibold">{skill.category}:</span> {skill.items.join(' • ')}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'projects' && projects.length > 0) {
                    return (
                        <div key={section} className="mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                                Projects
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="font-semibold">
                                        {project.name}
                                        {project.keywords.length > 0 && (
                                            <span className="text-xs font-normal text-slate-600 ml-2">
                                                [{project.keywords.join(', ')}]
                                            </span>
                                        )}
                                    </div>
                                    {project.bullets && project.bullets.length > 0 && (
                                        <div className="mt-1 text-xs text-slate-800">
                                            {project.bullets.map((line: string, i: number) => (
                                                <div key={i}>• {line.replace(/^[•\-\*]\s*/, '')}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'awards' && awards.length > 0) {
                    return (
                        <div key={section} className="mb-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                                Awards
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} className="mb-1 text-xs">
                                    <span className="font-semibold">{award.title}</span> - {award.awarder} ({award.date})
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
