import { useResumeStore } from '../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getSectionDividerStyle, getNameSize, getSectionTitleSize, getSpacingValue, getBulletIndentValue } from '../utils/formatting';

export function ClassicTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, formatting } = resumeData;

    const colorValue = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);

    return (
        <div style={{
            fontFamily: getFontFamilyCSS(formatting.fontFamily),
            fontSize: formatting.baseFontSize,
            lineHeight: formatting.lineSpacing,
            padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
            color: colorValue,
            width: '8.5in',
            minHeight: '11in',
            height: 'auto',
            backgroundColor: 'white',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <div style={{
                textAlign: formatting.headerAlignment,
                marginBottom: getSpacingValue(formatting.sectionSpacing)
            }}>
                <h1 style={{ fontSize: getNameSize(formatting.nameSize), fontWeight: 'bold', margin: '0 0 4pt 0', color: colorValue }}>
                    {basics.name}
                </h1>
                <div style={{ fontSize: '10pt', margin: '0', color: '#000000' }}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span> {formatting.separator} </span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span> {formatting.separator} </span>}
                    {basics.address && <span>{basics.address}</span>}
                    {basics.websites.length > 0 && basics.websites.map((site, idx) => (
                        <span key={idx}>
                            {(basics.email || basics.phone || basics.address || idx > 0) && <span> {formatting.separator} </span>}
                            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: colorValue, textDecoration: 'underline' }}>
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
                        <div key="education" style={{ marginBottom: '12pt', textAlign: 'left', breakInside: 'avoid-page' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                textAlign: 'left',
                                breakInside: 'avoid'
                            }}>
                                EDUCATION
                            </h2>
                            {education.map((edu, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt', breakInside: 'avoid' }}>
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
                        <div key="work" style={{ marginBottom: '12pt', textAlign: 'left', breakInside: 'avoid-page' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                textAlign: 'left',
                                breakInside: 'avoid'
                            }}>
                                EXPERIENCE
                            </h2>
                            {work.map((job, idx) => (
                                <div key={idx} style={{ marginBottom: '8pt', breakInside: 'avoid' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>{job.company}</span>
                                        <span>{job.startDate} - {job.endDate}</span>
                                    </div>
                                    <div style={{ fontStyle: 'italic', margin: '1pt 0' }}>
                                        {job.position}
                                        {job.location && `, ${job.location}`}
                                    </div>
                                    {job.bullets && job.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ margin: '2pt 0 0 0', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.filter(b => b.trim() !== '').map((line, i) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-0.5" style={{ color: '#000000', breakInside: 'avoid' }}>
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
                        <div key="skills" style={{ marginBottom: '12pt', textAlign: 'left', breakInside: 'avoid-page' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                textAlign: 'left',
                                breakInside: 'avoid'
                            }}>
                                SKILLS
                            </h2>
                            {skills.map((skillGroup, idx) => (
                                <div key={idx} style={{ margin: '2pt 0', color: '#000000', breakInside: 'avoid' }}>
                                    <span style={{ fontWeight: 'bold' }}>{skillGroup.category}: </span>
                                    <span>{skillGroup.items.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    );
                }

                if (sectionKey === 'projects' && projects.length > 0) {
                    return (
                        <div key="projects" style={{ marginBottom: '12pt', textAlign: 'left', breakInside: 'avoid-page' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                textAlign: 'left',
                                breakInside: 'avoid'
                            }}>
                                PROJECTS
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt', breakInside: 'avoid' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000000' }}>
                                        <span>
                                            {project.name}
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="ml-2 hover:underline font-normal text-xs" style={{ color: colorValue }}>
                                                    [{project.urlName || 'Link'}]
                                                </a>
                                            )}
                                        </span>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '9pt', opacity: 0.7 }}>
                                                {project.keywords.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    {project.bullets && project.bullets.filter(b => b.trim() !== '').length > 0 && (
                                        <ul className="list-none" style={{ margin: '2pt 0 0 0', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.filter(b => b.trim() !== '').map((line, i) => (
                                                <li key={i} className="flex gap-2 text-sm items-start mb-0.5" style={{ color: '#000000', breakInside: 'avoid' }}>
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
                        <div key="awards" style={{ marginBottom: '12pt', textAlign: 'left', breakInside: 'avoid-page' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
                                textAlign: 'left',
                                breakInside: 'avoid'
                            }}>
                                AWARDS
                            </h2>
                            {awards.map((award, idx) => (
                                <div key={idx} style={{ margin: '2pt 0', color: '#000000', breakInside: 'avoid' }}>
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
