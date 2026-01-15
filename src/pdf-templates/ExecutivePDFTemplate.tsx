import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
import { getPDFBulletIndent } from '../utils/pdfFormatting';

// Executive template styles - elegant and professional
const createStyles = (formatting: FormattingOptions) => StyleSheet.create({
    page: {
        padding: '0.75in',
        fontFamily: 'Helvetica',
        fontSize: 11,
        backgroundColor: '#ffffff',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '2pt solid #047857', // Green-700
    },
    name: {
        fontSize: 36,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
        color: '#047857',
    },
    contactInfo: {
        fontSize: 10,
        fontWeight: 'semibold',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    separator: {
        marginHorizontal: 10,
        fontWeight: 'bold',
        opacity: 0.4,
    },
    websiteRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 3,
        gap: 4,
    },
    websiteLink: {
        fontSize: 10,
        color: '#047857',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 14,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderTop: '2pt solid #047857',
        borderBottom: '2pt solid #047857',
        paddingVertical: 3,
        marginBottom: 10,
    },
    entryContainer: {
        marginBottom: 12,
    },
    entryHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    entryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateRange: {
        fontSize: 10,
        opacity: 0.7,
    },
    entrySubtitle: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#334155',
        marginBottom: 6,
    },
    bulletPoint: {
        fontSize: 10,
        marginLeft: getPDFBulletIndent(formatting.bulletIndent),
        marginBottom: 2,
        color: '#000000',
        flexDirection: 'row',
    },
    bulletSymbol: {
        color: '#047857',
        marginRight: 6,
    },
    skillRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    skillCategory: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#64748b',
        width: 90,
    },
    skillItems: {
        fontSize: 10,
        color: '#1e293b',
        fontWeight: 'medium',
        flex: 1,
    },
    projectKeywords: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#64748b',
        marginBottom: 6,
    },
});

interface ExecutivePDFTemplateProps {
    data: ResumeData;
}

export function ExecutivePDFTemplate({ data }: ExecutivePDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <View style={styles.contactInfo}>
                        {[basics.email, basics.phone, basics.address]
                            .filter(Boolean)
                            .map((item, idx, arr) => (
                                <Text key={idx}>
                                    {item}
                                    {idx < arr.length - 1 && <Text style={styles.separator}> | </Text>}
                                </Text>
                            ))}
                    </View>
                    {basics.websites.length > 0 && (
                        <View style={styles.websiteRow}>
                            {basics.websites.map((site, idx) => (
                                <Text key={idx}>
                                    {idx > 0 && <Text style={styles.separator}> | </Text>}
                                    <Link src={site.url} style={styles.websiteLink}>
                                        {site.name}
                                    </Link>
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile') return null;

                    if (sectionKey === 'work' && work.length > 0) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>Professional Experience</Text>
                                {work.map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={false}>
                                        <View style={styles.entryHeaderRow}>
                                            <Text style={styles.entryTitle}>{job.company}</Text>
                                            <Text style={styles.dateRange}>
                                                {job.startDate} — {job.endDate}
                                            </Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {job.position}
                                            {job.location && ` | ${job.location}`}
                                        </Text>
                                        {job.bullets && job.bullets.filter(b => b.trim()).length > 0 && (
                                            <View>
                                                {job.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>•</Text>
                                                        <Text>{bullet.replace(/^[•\-\*]\s*/, '')}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <View key="education" style={styles.section} wrap={false}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                {education.map((edu, idx) => (
                                    <View key={idx} style={{ marginBottom: 8 }}>
                                        <View style={styles.entryHeaderRow}>
                                            <Text style={styles.entryTitle}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{edu.graduationDate}</Text>
                                        </View>
                                        <Text style={{ fontSize: 10 }}>
                                            {edu.degree} in {edu.field}
                                        </Text>
                                        {edu.gpa && (
                                            <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#64748b' }}>
                                                GPA: {edu.gpa}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'skills' && skills.length > 0) {
                        return (
                            <View key="skills" style={styles.section} wrap={false}>
                                <Text style={styles.sectionHeader}>Technical Skills</Text>
                                {skills.map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillRow}>
                                        <Text style={styles.skillCategory}>{skillGroup.category}</Text>
                                        <Text style={styles.skillItems}>
                                            {skillGroup.items.join(' • ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'projects' && projects.length > 0) {
                        return (
                            <View key="projects" style={styles.section}>
                                <Text style={styles.sectionHeader}>Key Projects</Text>
                                {projects.map((project, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={false}>
                                        <View style={styles.entryHeaderRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 9, color: '#047857' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </View>
                                            <Text style={{ fontSize: 9, opacity: 0.7 }}>
                                                {project.startDate} — {project.endDate}
                                            </Text>
                                        </View>
                                        {project.keywords.length > 0 && (
                                            <Text style={styles.projectKeywords}>
                                                Technologies: {project.keywords.join(', ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View>
                                                {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>•</Text>
                                                        <Text>{bullet.replace(/^[•\-\*]\s*/, '')}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'awards' && awards.length > 0) {
                        return (
                            <View key="awards" style={styles.section} wrap={false}>
                                <Text style={styles.sectionHeader}>Honors & Awards</Text>
                                {awards.map((award, idx) => (
                                    <View key={idx} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: -0.3 }}>
                                            {award.title}
                                            {award.date && (
                                                <Text style={{ fontWeight: 'normal', textTransform: 'none', opacity: 0.6, fontSize: 10, marginLeft: 6 }}>
                                                    ({award.date})
                                                </Text>
                                            )}
                                        </Text>
                                        <Text style={{ fontSize: 10, fontStyle: 'italic', opacity: 0.8 }}>
                                            {award.awarder}
                                        </Text>
                                        {award.summary && (
                                            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>
                                                {award.summary}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    return null;
                })}
            </Page>
        </Document>
    );
}
