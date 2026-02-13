import { useResumeStore } from '../../store';
import { getFontFamilyCSS, getBulletSymbol, getColorValue, getBulletIndentValue, getSectionTitleSize, getEntrySpacingValue, getBulletGapValue, getSectionHeaderCase, getNameSize } from '../../lib/formatting';
import { parseBoldText } from '../../lib/parseBoldText';
import type { SectionKey, Education, WorkExperience, Skill, Project, Award, CustomSection } from '../../types';

/**
 * LaTeX Template (#11)
 * Mimics the look of LaTeX/Overleaf academic resumes:
 * Computer Modern-style serif font, minimal decoration, very clean layout.
 */
export function LaTeXTemplate() {
    const { resumeData } = useResumeStore();
    const { basics, work, education, skills, projects, awards, sections, customSections, formatting } = resumeData;

    const accentColor = getColorValue(formatting.colorTheme, formatting.customColor);
    const bulletSymbol = getBulletSymbol(formatting.bulletStyle);
    const bulletIndent = getBulletIndentValue(formatting.bulletIndent);
    const bulletGap = getBulletGapValue(formatting.bulletGap);
    const sectionTitleSize = getSectionTitleSize(formatting.sectionTitleSize);
    const entrySpacing = getEntrySpacingValue(formatting.entrySpacing);
    const sectionHeaderCase = getSectionHeaderCase(formatting.sectionHeaderStyle);
    const nameSize = getNameSize(formatting.nameSize);

    const containerStyle: React.CSSProperties = {
        fontFamily: getFontFamilyCSS(formatting.fontFamily),
        padding: `${formatting.marginTop}in ${formatting.marginRight}in ${formatting.marginBottom}in ${formatting.marginLeft}in`,
        maxWidth: '8.5in',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontSize: `${formatting.baseFontSize}px`,
        lineHeight: '1.35',
    };

    const sectionHeaderStyle: React.CSSProperties = {
        fontSize: sectionTitleSize,
        fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
        textTransform: sectionHeaderCase as React.CSSProperties['textTransform'],
        color: '#000000',
        marginBottom: '6px',
        paddingBottom: '2px',
        borderBottom: '1px solid #000000',
        letterSpacing: '0.5px',
        textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
    };

    const renderBullets = (bullets: string[], type: 'bullets' | 'paragraphs' = 'bullets') => {
        const items = bullets.filter(b => b.trim());
        if (items.length === 0) return null;

        if (type === 'paragraphs') {
            return (
                <div style={{ marginTop: '3px' }}>
                    {items.map((p, i) => (
                        <p key={i} style={{ margin: '0 0 4px 0', textAlign: 'justify' }}>{parseBoldText(p)}</p>
                    ))}
                </div>
            );
        }

        return (
            <ul style={{ margin: '2px 0 0 0', paddingLeft: bulletIndent, listStyle: 'none' }}>
                {items.map((bullet, i) => (
                    <li key={i} style={{ marginBottom: '1px', display: 'flex', gap: bulletGap }}>
                        <span style={{ color: '#000000', flexShrink: 0 }}>{bulletSymbol}</span>
                        <span>{parseBoldText(bullet.replace(/^[•\-\*]\s*/, ''))}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderSection = (key: SectionKey) => {
        if (key === 'profile' && basics.summary) {
            return (
                <div key="profile" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Research Interests</div>
                    <p style={{ margin: '4px 0 0 0', color: '#333333', lineHeight: '1.5' }}>
                        {parseBoldText(basics.summary)}
                    </p>
                </div>
            );
        }

        if (key === 'education' && education.length > 0) {
            return (
                <div key="education" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Education</div>
                    {education.map((edu: Education, idx: number) => (
                        <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <strong>{edu.institution}</strong>
                                <span style={{ fontSize: '0.9em', color: '#444444' }}>{edu.graduationDate}</span>
                            </div>
                            <div style={{ fontStyle: 'italic', color: '#444444' }}>
                                {edu.degree}{edu.field && ` in ${edu.field}`}
                            </div>
                            {edu.gpa && <div style={{ fontSize: '0.9em', color: '#666666' }}>GPA: {edu.gpa}</div>}
                        </div>
                    ))}
                </div>
            );
        }

        if (key === 'work' && work.length > 0) {
            return (
                <div key="work" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Experience</div>
                    {work.map((job: WorkExperience, idx: number) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <strong>{job.company}</strong>
                                <span style={{ fontSize: '0.9em', color: '#444444' }}>{job.startDate} — {job.endDate}</span>
                            </div>
                            <div style={{ fontStyle: 'italic', color: '#444444' }}>
                                {job.position}{job.location && `, ${job.location}`}
                            </div>
                            {renderBullets(job.bullets)}
                        </div>
                    ))}
                </div>
            );
        }

        if (key === 'skills' && skills.length > 0) {
            return (
                <div key="skills" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Skills</div>
                    {skills.map((group: Skill, idx: number) => (
                        <div key={idx} style={{ marginBottom: '3px' }}>
                            <strong>{group.category}:</strong>{' '}
                            <span style={{ color: '#333333' }}>{group.items.join(', ')}</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (key === 'projects' && projects.length > 0) {
            return (
                <div key="projects" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Projects</div>
                    {projects.map((project: Project, idx: number) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div>
                                    <strong>{project.name}</strong>
                                    {project.url && (
                                        <a href={project.url} style={{ marginLeft: '6px', fontSize: '0.85em', color: accentColor, textDecoration: 'underline' }}>
                                            [{project.urlName || 'Link'}]
                                        </a>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.9em', color: '#444444' }}>{project.startDate} — {project.endDate}</span>
                            </div>
                            {project.keywords.length > 0 && (
                                <div style={{ fontSize: '0.85em', fontStyle: 'italic', color: '#777777', marginBottom: '2px' }}>
                                    {project.keywords.join(', ')}
                                </div>
                            )}
                            {renderBullets(project.bullets)}
                        </div>
                    ))}
                </div>
            );
        }

        if (key === 'awards' && awards.length > 0) {
            return (
                <div key="awards" style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>Honors & Awards</div>
                    {awards.map((award: Award, idx: number) => (
                        <div key={idx} style={{ marginBottom: '4px' }}>
                            <span>
                                <strong>{award.title}</strong>
                                {award.date && <span style={{ color: '#666666' }}> · {award.date}</span>}
                            </span>
                            {award.awarder && <div style={{ fontSize: '0.9em', fontStyle: 'italic', color: '#666666' }}>{award.awarder}</div>}
                            {award.summary && <div style={{ fontSize: '0.9em', color: '#555555', marginTop: '2px' }}>{award.summary}</div>}
                        </div>
                    ))}
                </div>
            );
        }

        // Custom sections
        const cs = customSections.find((s: CustomSection) => s.id === key);
        if (cs && cs.items && cs.items.length > 0) {
            return (
                <div key={cs.id} style={{ marginBottom: entrySpacing }}>
                    <div style={sectionHeaderStyle}>{cs.title}</div>
                    {cs.items.map((entry, idx) => (
                        <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <div style={{ flex: 1 }}>
                                    <strong>{entry.title || 'Untitled'}</strong>
                                    {entry.subtitle && <span style={{ fontStyle: 'italic', color: '#444444', marginLeft: '6px' }}>{entry.subtitle}</span>}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    {entry.date && <div style={{ fontSize: '0.9em', color: '#444444' }}>{entry.date}</div>}
                                    {entry.location && <div style={{ fontSize: '0.85em', color: '#666666' }}>{entry.location}</div>}
                                </div>
                            </div>
                            {entry.link && <a href={entry.link} style={{ fontSize: '0.85em', color: accentColor, display: 'block', marginBottom: '3px' }}>{entry.link}</a>}
                            {renderBullets(entry.bullets, cs.type === 'text' ? 'paragraphs' : 'bullets')}
                        </div>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={{ textAlign: formatting.headerAlignment, marginBottom: '10px' }}>
                <h1 style={{
                    fontSize: nameSize,
                    fontWeight: formatting.fontWeightName === 'HEAVY' ? 900 : formatting.fontWeightName === 'BOLD' ? 700 : 400,
                    margin: '0 0 4px 0',
                    color: '#000000',
                    letterSpacing: '1px',
                }}>
                    {basics.name || 'Your Name'}
                </h1>
                <div style={{ fontSize: '0.9em', color: '#444444' }}>
                    {basics.email && <span>{basics.email}</span>}
                    {basics.email && basics.phone && <span> · </span>}
                    {basics.phone && <span>{basics.phone}</span>}
                    {(basics.email || basics.phone) && basics.address && <span> · </span>}
                    {basics.address && <span>{basics.address}</span>}
                    {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && <span> · </span>}
                    {basics.websites.map((site, i) => (
                        <span key={i}>
                            {i > 0 && <span> · </span>}
                            <a href={site.url} style={{ color: accentColor, textDecoration: 'underline' }}>
                                {site.name || site.url}
                            </a>
                        </span>
                    ))}
                </div>
                {/* Thick rule under header */}
                <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '8px 0 0 0' }} />
            </div>

            {/* Sections */}
            {sections.map(renderSection)}
        </div>
    );
}
