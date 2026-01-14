import { useResumeStore } from '../store';

export function ClassicTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections } = resumeData;
    const separator = basics.separator || '•';

    return (
        <div style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: '11pt',
            lineHeight: '1.15',
            padding: '0.5in',
            color: '#000000'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '8pt' }}>
                <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 4pt 0', textTransform: 'uppercase' }}>
                    {basics.name}
                </h1>
                <div style={{ fontSize: '10pt', margin: '0' }}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span> {separator} </span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span> {separator} </span>}
                    {basics.address && <span>{basics.address}</span>}
                    {basics.websites.length > 0 && basics.websites.map((site, idx) => (
                        <span key={idx}>
                            <span> {separator} </span>
                            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0000EE', textDecoration: 'underline' }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
            </div>

            {/* Sections */}
            {sections.map((sectionKey) => {
                if (sectionKey === 'education' && education.length > 0) {
                    return (
                        <div key="education" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                borderBottom: '1.5pt solid #000',
                                margin: '0 0 6pt 0',
                                paddingBottom: '2pt'
                            }}>
                                EDUCATION
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{edu.institution}</span>
                                        <span>{edu.graduationDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', margin: '1pt 0' }}>{edu.degree}{edu.field && ` in ${edu.field}`}</div>
                                    {edu.gpa && <div style={{ margin: '1pt 0' }}>GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'work' && work.length > 0) {
                    return (
                        <div key="work" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                borderBottom: '1.5pt solid #000',
                                margin: '0 0 6pt 0',
                                paddingBottom: '2pt'
                            }}>
                                EXPERIENCE
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} style={{ marginBottom: '8pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{job.company}</span>
                                        <span>{job.startDate} - {job.endDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', margin: '1pt 0' }}>
                                        {job.position}
                                        {job.location && `, ${job.location}`}
                                    </div>
                                    {job.description && (
                                        <div style={{ margin: '2pt 0 0 0' }}>
                                            {job.description.split('\n').map((line, i) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>{line}</div>
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
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                borderBottom: '1.5pt solid #000',
                                margin: '0 0 6pt 0',
                                paddingBottom: '2pt'
                            }}>
                                SKILLS
                            </h2>
                            {skills.map((skillGroup, idx) => (
                                <div key={idx} style={{ margin: '2pt 0' }}>
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
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                borderBottom: '1.5pt solid #000',
                                margin: '0 0 6pt 0',
                                paddingBottom: '2pt'
                            }}>
                                PROJECTS
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{project.name}</span>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>
                                                {project.keywords.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    {project.description && (
                                        <div style={{ margin: '2pt 0 0 0' }}>
                                            {project.description.split('\n').map((line, i) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>{line}</div>
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
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                borderBottom: '1.5pt solid #000',
                                margin: '0 0 6pt 0',
                                paddingBottom: '2pt'
                            }}>
                                AWARDS
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} style={{ margin: '2pt 0' }}>
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
