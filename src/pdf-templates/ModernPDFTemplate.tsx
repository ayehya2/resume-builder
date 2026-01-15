import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
import {
    getPDFFontFamily,
    getPDFBulletSymbol,
    getPDFColorValue,
    getPDFPagePadding,
    getPDFFontSize,
    getPDFNameSize,
    getPDFSectionTitleSize,
    getPDFSectionMargin,
    getPDFBulletIndent,
} from '../utils/pdfFormatting';

// Dynamic styles factory - creates styles based on formatting options
const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);

    return StyleSheet.create({
        page: {
            padding: getPDFPagePadding(formatting),
            fontFamily: getPDFFontFamily(formatting.fontFamily),
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
        },
        header: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            paddingBottom: 10,
            borderBottom: `4pt solid ${accentColor}`,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: 'bold',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: 8,
            letterSpacing: 0.5,
        },
        contactInfo: {
            fontSize: baseFontSize - 1,
            color: '#64748b',
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 4,
        },
        contactSeparator: {
            marginHorizontal: 8,
            color: '#cbd5e1',
        },
        websiteLink: {
            fontSize: baseFontSize - 1,
            color: accentColor,
            textDecoration: 'none',
            marginRight: 12,
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.sectionTitleBold ? 'bold' : 'normal',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: 8,
            paddingLeft: 12,
            borderLeft: `8pt solid ${accentColor}`,
            letterSpacing: 1,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
        },
        entryContainer: {
            marginBottom: 12,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        entryTitle: {
            fontSize: baseFontSize + 3,
            fontWeight: 'bold',
            color: '#000000',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            color: '#64748b',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#334155',
            marginBottom: 4,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: 3,
            color: '#000000',
        },
        bulletSymbol: {
            color: accentColor,
            marginRight: 8,
        },
        skillCategory: {
            fontSize: baseFontSize - 1,
            marginBottom: 4,
        },
        skillCategoryName: {
            fontWeight: 'bold',
        },
        skillItems: {
            color: '#334155',
        },
        projectKeywords: {
            fontSize: baseFontSize - 2,
            fontStyle: 'italic',
            color: '#64748b',
            marginTop: 2,
        },
    });
};

interface ModernPDFTemplateProps {
    data: ResumeData;
}

export function ModernPDFTemplate({ data }: ModernPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;

    // Create dynamic styles based on formatting options
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <View style={styles.contactInfo}>
                        {basics.email && <Text>{basics.email}</Text>}
                        {basics.email && basics.phone && <Text style={styles.contactSeparator}>|</Text>}
                        {basics.phone && <Text>{basics.phone}</Text>}
                        {(basics.email || basics.phone) && basics.address && <Text style={styles.contactSeparator}>|</Text>}
                        {basics.address && <Text>{basics.address}</Text>}
                    </View>
                    {basics.websites.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                            {basics.websites.map((site, i) => (
                                <Link key={i} src={site.url} style={styles.websiteLink}>
                                    {site.name || site.url}
                                </Link>
                            ))}
                        </View>
                    )}
                </View>

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile') return null;

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <View key="education" style={styles.section} wrap={false}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                {education.map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{edu.graduationDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </Text>
                                        {edu.gpa && <Text style={{ fontSize: 10, fontWeight: 'bold' }}>GPA: {edu.gpa}</Text>}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'work' && work.length > 0) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>Experience</Text>
                                {work.map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={false}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{job.company}</Text>
                                            <Text style={styles.dateRange}>{job.startDate} — {job.endDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {job.position}{job.location && `, ${job.location}`}
                                        </Text>
                                        {job.bullets && job.bullets.filter(b => b.trim()).length > 0 && (
                                            <View>
                                                {job.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <Text key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                        {bullet.replace(/^[•\-\*]\s*/, '')}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}
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
                                            <Text style={styles.skillCategoryName}>{skillGroup.category}: </Text>
                                            <Text style={styles.skillItems}>{skillGroup.items.join(', ')}</Text>
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
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 10, color: '#4f46e5', textDecoration: 'underline' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </View>
                                            <Text style={styles.dateRange}>{project.startDate} — {project.endDate}</Text>
                                        </View>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <Text style={styles.projectKeywords}>
                                                {project.keywords.join(' • ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View style={{ marginTop: 4 }}>
                                                {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <Text key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>•</Text>
                                                        {bullet.replace(/^[•\-\*]\s*/, '')}
                                                    </Text>
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
                                <Text style={styles.sectionHeader}>Awards</Text>
                                {awards.map((award, idx) => (
                                    <View key={idx} style={{ marginBottom: 8 }}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                            {award.title}
                                            {award.date && <Text style={{ fontWeight: 'normal', color: '#64748b' }}> — {award.date}</Text>}
                                        </Text>
                                        {award.awarder && (
                                            <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#64748b' }}>
                                                {award.awarder}
                                            </Text>
                                        )}
                                        {award.summary && (
                                            <Text style={{ fontSize: 9, color: '#334155', marginTop: 2 }}>
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
