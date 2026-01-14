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
            color: colorValue
        }}>
            {/* Header */}
            <div style={{
                textAlign: formatting.headerAlignment,
                marginBottom: getSpacingValue(formatting.sectionSpacing),
                ...getSectionDividerStyle(formatting.sectionDividers)
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
                        <div key="education" style={{ marginBottom: '12pt' }}>
                            <h2 style={{
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none'
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
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none'
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
                                    {job.bullets && job.bullets.length > 0 && (
                                        <div style={{ margin: '2pt 0 0 0', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {job.bullets.map((bullet, i) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>{bulletSymbol} {bullet}</div>
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
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none'
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
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none'
                            }}>
                                PROJECTS
                            </h2>
                            {projects.map((project, idx) => (
                                <div key={idx} style={{ marginBottom: '6pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>
                                            {project.name}
                                            {project.url && (
                                                <span>
                                                    {' '}•{' '}
                                                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0000EE', textDecoration: 'underline', fontWeight: 'normal' }}>
                                                        {project.urlName || 'Link'}
                                                    </a>
                                                </span>
                                            )}
                                        </span>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>
                                                {project.keywords.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                    {project.bullets && project.bullets.length > 0 && (
                                        <div style={{ margin: '2pt 0 0 0', marginLeft: getBulletIndentValue(formatting.bulletIndent) }}>
                                            {project.bullets.map((bullet, i) => (
                                                <div key={i} style={{ margin: '1pt 0' }}>{bulletSymbol} {bullet}</div>
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
                                fontSize: getSectionTitleSize(formatting.sectionTitleSize),
                                fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
                                textTransform: 'uppercase',
                                ...getSectionDividerStyle(formatting.sectionDividers),
                                margin: `0 0 ${getSpacingValue(formatting.sectionSpacing)} 0`,
                                textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none'
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
