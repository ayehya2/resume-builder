import { useResumeStore } from '../store';
import { getBulletIndentValue } from '../utils/formatting';

export function ModernTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

    return (
        <div style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '11pt',
            lineHeight: '1.15',
            padding: '0.5in',
            color: '#000000'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '12pt', paddingBottom: '8pt', borderBottom: '2pt solid #2563eb' }}>
                <h1 style={{ fontSize: '22pt', fontWeight: 'bold', margin: '0 0 4pt 0', color: '#1e40af' }}>
                    {basics.name}
                </h1>
                <div style={{ fontSize: '10pt', margin: '0', color: '#334155' }}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span> • </span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span> • </span>}
                    {basics.address && <span>{basics.address}</span>}
                </div>
                {basics.websites.length > 0 && (
                    <div style={{ fontSize: '10pt', margin: '2pt 0 0 0' }}>
                        {basics.websites.map((site, idx) => (
                            <span key={idx}>
                                {idx > 0 && ' • '}
                                <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                    {site.name || site.url}
                                </a>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Sections */}
            {sections.map((sectionKey) => {
                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '13pt',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 6pt 0',
                                borderLeft: '3pt solid #2563eb',
                                paddingLeft: '8pt'
                            }}>
                                EDUCATION
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt', paddingLeft: '8pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{edu.institution}</span>
                                        <span style={{ fontSize: '10pt' }}>{edu.graduationDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', margin: '1pt 0', fontSize: '10pt' }}>
                                        {edu.degree}{edu.field && ` in ${edu.field}`}
                                    </div>
                                    {edu.gpa && <div style={{ margin: '1pt 0', fontSize: '10pt' }}>GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '13pt',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 6pt 0',
                                borderLeft: '3pt solid #2563eb',
                                paddingLeft: '8pt'
                            }}>
                                EXPERIENCE
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} style={{ marginBottom: '8pt', paddingLeft: '8pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{job.company}</span>
                                        <span style={{ fontSize: '10pt' }}>{job.startDate} - {job.endDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', margin: '1pt 0', fontSize: '10pt' }}>
                                        {job.position}{job.location && `, ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.length > 0 && (
                                        <div style={{ margin: '2pt 0 0 0', fontSize: '10pt', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.map((line: string, i: number) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>• {line}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'skills' && skills.length > 0) {
                    return (
                        <div key="skills" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '13pt',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 6pt 0',
                                borderLeft: '3pt solid #2563eb',
                                paddingLeft: '8pt'
                            }}>
                                SKILLS
                            </h2>
                            {skills.map((skillGroup, idx) => (
                                <div key={idx} style={{ margin: '2pt 0', paddingLeft: '8pt', fontSize: '10pt' }}>
                                    <span style={{ fontWeight: 'bold' }}>{skillGroup.category}: </span>
                                    <span>{skillGroup.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '13pt',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 6pt 0',
                                borderLeft: '3pt solid #2563eb',
                                paddingLeft: '8pt'
                            }}>
                                PROJECTS
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt', paddingLeft: '8pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{project.name}</span>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9pt' }}>
                                                {project.keywords.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    {project.bullets && project.bullets.length > 0 && (
                                        <div style={{ margin: '2pt 0 0 0', fontSize: '10pt', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.map((line: string, i: number) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>• {line}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'awards' && awards.length > 0) {
                    return (
                        <div key="awards" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '13pt',
                                fontWeight: 'bold',
                                color: '#1e40af',
                                margin: '0 0 6pt 0',
                                borderLeft: '3pt solid #2563eb',
                                paddingLeft: '8pt'
                            }}>
                                AWARDS
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} style={{ margin: '2pt 0', paddingLeft: '8pt', fontSize: '10pt' }}>
                                    <span style={{ fontWeight: 'bold' }}>{award.title}</span>
                                    {award.date && <span> • {award.date}</span>}
                                    {award.awarder && <span style={{ fontStyle: 'italic' }}> ({award.awarder})</span>}
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
