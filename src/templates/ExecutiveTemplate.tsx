import { useResumeStore } from '../store';
import { getBulletIndentValue } from '../utils/formatting';

export function ExecutiveTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

    return (
        <div className="bg-white p-8 font-sans text-slate-900" style={{ fontSize: '11pt', lineHeight: '1.4' }}>
            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b-2 border-slate-900">
                <h1 className="text-3xl font-semibold mb-2 tracking-wide">
                    {basics.name || 'YOUR NAME'}
                </h1>
                <div className="text-sm">
                    {[basics.email, basics.phone, basics.address].filter(Boolean).join(' | ')}
                </div>
                {basics.websites.length > 0 && (
                    <div className="text-sm mt-1">
                        {basics.websites.map((w, i) => (
                            <span key={i}>
                                {w.url ? <a href={w.url} className="hover:underline">{w.name}</a> : w.name}
                                {i < basics.websites.length - 1 && ' | '}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections */}
            {sections.map((section) => {
                if (section === 'profile') return null;

                if (section === 'work' && work.length > 0) {
                    return (
                        <div key={section} className="mb-5">
                            <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-slate-300">
                                PROFESSIONAL EXPERIENCE
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} className="mb-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-lg">{job.company}</span>
                                        <span className="text-sm text-slate-600">{job.startDate} - {job.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="italic text-slate-700">{job.position}</span>
                                        <span className="text-sm text-slate-600">{job.location}</span>
                                    </div>
                                    {job.bullets && job.bullets.length > 0 && (
                                        <div className="mt-1 text-xs leading-relaxed" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
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
                        <div key={section} className="mb-5">
                            <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-slate-300">
                                EDUCATION
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold">{edu.institution}</span>
                                        <span className="text-sm text-slate-600">{edu.graduationDate}</span>
                                    </div>
                                    <div className="italic">
                                        {edu.degree} in {edu.field}
                                    </div>
                                    {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'skills' && skills.length > 0) {
                    return (
                        <div key={section} className="mb-5">
                            <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-slate-300">
                                CORE COMPETENCIES
                            </h2>
                            {skills.map((skill, idx) => (
                                <div key={idx} className="mb-2">
                                    <span className="font-semibold">{skill.category}:</span>{' '}
                                    <span>{skill.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (section === 'projects' && projects.length > 0) {
                    return (
                        <div key={section} className="mb-5">
                            <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-slate-300">
                                KEY PROJECTS
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="font-semibold">{project.name}</div>
                                    {project.bullets && project.bullets.length > 0 && (
                                        <div className="mt-1 text-xs leading-relaxed" style={{ marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
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
                        <div key={section} className="mb-5">
                            <h2 className="text-lg font-semibold mb-3 pb-1 border-b border-slate-300">
                                HONORS & AWARDS
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} className="mb-2">
                                    <span className="font-semibold">{award.title}</span> - {award.awarder} ({award.date})
                                    {award.summary && <div className="text-sm mt-1">{award.summary}</div>}
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
