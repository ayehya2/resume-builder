import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
import { getPDFBulletIndent } from '../utils/pdfFormatting';

// Technical template styles - modern with top/bottom border section headers
const createStyles = (formatting: FormattingOptions) => StyleSheet.create({
    page: {
        padding: '0.75in',
        fontFamily: 'Helvetica',
        fontSize: 11,
        backgroundColor: '#ffffff',
    },
    header: {
        textAlign: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 34,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: -0.5,
        color: '#1e40af', // Blue-700
    },
    contactInfo: {
        fontSize: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
    },
    separator: {
        marginHorizontal: 6,
        opacity: 0.5,
    },
    horizontalRule: {
        height: 2,
        backgroundColor: '#1e40af',
        marginBottom: 12,
    },
    section: {
        marginBottom: 14,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        borderTop: '2pt solid #1e40af',
        borderBottom: '2pt solid #1e40af',
        paddingVertical: 3,
        marginBottom: 8,
    },
    entryContainer: {
        marginBottom: 12,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    entryTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
    },
    dateRange: {
        fontSize: 10,
        color: '#000000',
    },
    entrySubtitle: {
        fontSize: 10,
        fontStyle: 'italic',
        marginBottom: 3,
        color: '#000000',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bulletPoint: {
        fontSize: 10,
        marginLeft: getPDFBulletIndent(formatting.bulletIndent),
        marginBottom: 2,
        color: '#000000',
        flexDirection: 'row',
    },
    bulletSymbol: {
        color: '#1e40af',
        marginRight: 6,
    },
    skillCategory: {
        fontSize: 10,
        marginBottom: 2,
    },
    skillCategoryName: {
        fontWeight: 'bold',
    },
    projectKeywords: {
        fontSize: 9,
        fontStyle: 'italic',
        opacity: 0.8,
        marginBottom: 3,
    },
});

interface TechnicalPDFTemplateProps {
    data: ResumeData;
}

export function TechnicalPDFTemplate({ data }: TechnicalPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <View style={styles.contactInfo}>
                        {[
                            basics.email,
                            basics.phone,
                            basics.address,
                            ...basics.websites.map(w => w.name)
                        ].filter(Boolean).map((item, idx, arr) => (
                            <Text key={idx}>
                                {item}
                                {idx < arr.length - 1 && <Text style={styles.separator}> | </Text>}
                            </Text>
                        ))}
                    </View>
                </View>

                <View style={styles.horizontalRule} />

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile') return null;

                    if (sectionKey === 'work' && work.length > 0) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>Professional Experience</Text>
                                {work.map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={false}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{job.company}</Text>
                                            <Text style={styles.dateRange}>{job.startDate} — {job.endDate}</Text>
                                        </View>
                                        <View style={styles.entrySubtitle}>
                                            <Text>{job.position}</Text>
                                            <Text>{job.location}</Text>
                                        </View>
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
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{edu.institution}</Text>
                                            <Text style={{ fontSize: 10 }}>{edu.graduationDate}</Text>
                                        </View>
                                        <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
                                            {edu.degree} in {edu.field} {edu.gpa && `• GPA: ${edu.gpa}`}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'skills' && skills.length > 0) {
                        return (
                            <View key="skills" style={styles.section} wrap={false}>
                                <Text style={styles.sectionHeader}>Skills</Text>
                                {skills.map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillCategory}>
                                        <Text>
                                            <Text style={styles.skillCategoryName}>{skillGroup.category}:</Text>
                                            {' '}{skillGroup.items.join(', ')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'projects' && projects.length > 0) {
                        return (
                            <View key="projects" style={styles.section}>
                                <Text style={styles.sectionHeader}>Projects</Text>
                                {projects.map((project, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={false}>
                                        <View style={styles.entryHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 9, color: '#1e40af' }}>
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
                                    <View key={idx} style={{ marginBottom: 4 }}>
                                        <Text style={{ fontSize: 10 }}>
                                            <Text style={{ fontWeight: 'bold' }}>{award.title}</Text>
                                            {' '}— {award.awarder} ({award.date})
                                        </Text>
                                        {award.summary && (
                                            <Text style={{ fontSize: 9, fontStyle: 'italic', opacity: 0.8 }}>
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
