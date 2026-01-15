import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../../types';
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
    getPDFSectionBorderStyle,
    getPDFEntrySpacing,
    getPDFBulletGap,
    getPDFSectionHeaderStyle,
} from '../../lib/pdfFormatting';

// Dynamic styles factory - creates styles based on formatting options
const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);
    const sectionBorder = getPDFSectionBorderStyle(formatting.sectionDividers, accentColor);

    return StyleSheet.create({
        page: {
            padding: getPDFPagePadding(formatting),
            fontFamily: getPDFFontFamily(formatting.fontFamily),
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
        },
        header: {
            textAlign: formatting.headerAlignment,
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            marginBottom: 6,
            color: accentColor,
        },
        contactInfo: {
            fontSize: baseFontSize - 1,
            color: '#000000',
        },
        separator: {
            marginHorizontal: 4,
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'underline',
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 8,
            ...sectionBorder,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 3,
        },
        entryTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#000000',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            color: '#000000',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#000000',
            marginBottom: 3,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: 2,
            color: '#000000',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: accentColor,
        },
        skillCategory: {
            fontSize: baseFontSize - 1,
            marginBottom: 3,
        },
        skillCategoryName: {
            fontWeight: 'bold',
        },
        projectKeywords: {
            fontSize: baseFontSize - 2,
            fontStyle: 'italic',
            color: '#666666',
            marginTop: 2,
        },
    });
};

interface ClassicPDFTemplateProps {
    data: ResumeData;
}

export function ClassicPDFTemplate({ data }: ClassicPDFTemplateProps) {
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
                        <Text>
                            {basics.email && basics.email}
                            {basics.email && basics.phone && ` ${formatting.separator} `}
                            {basics.phone && basics.phone}
                            {(basics.email || basics.phone) && basics.address && ` ${formatting.separator} `}
                            {basics.address && basics.address}
                        </Text>
                        {basics.websites.length > 0 && (
                            <View style={{ flexDirection: 'row', justifyContent: formatting.headerAlignment === 'center' ? 'center' : formatting.headerAlignment === 'right' ? 'flex-end' : 'flex-start', marginTop: 2 }}>
                                {basics.websites.map((site, i) => (
                                    <View key={i} style={{ flexDirection: 'row' }}>
                                        {i > 0 && <Text style={styles.separator}> {formatting.separator} </Text>}
                                        <Link src={site.url} style={styles.websiteLink}>
                                            {site.name || site.url}
                                        </Link>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Render sections in user-defined order */}
                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile') return null;

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>EDUCATION</Text>
                                {education.map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{edu.graduationDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </Text>
                                        {edu.gpa && <Text style={{ fontSize: 10 }}>GPA: {edu.gpa}</Text>}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'work' && work.length > 0) {
                        return (
                            <View key="work" style={styles.section}>
                                <Text style={styles.sectionHeader}>EXPERIENCE</Text>
                                {work.map((job, idx) => (
                                    <View key={idx} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{job.company}</Text>
                                            <Text style={styles.dateRange}>{job.startDate} - {job.endDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {job.position}{job.location && `, ${job.location}`}
                                        </Text>
                                        {job.bullets && job.bullets.filter(b => b.trim()).length > 0 && (
                                            <View>
                                                {job.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
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

                    if (sectionKey === 'skills' && skills.length > 0) {
                        return (
                            <View key="skills" style={styles.section}>
                                <Text style={styles.sectionHeader}>SKILLS</Text>
                                {skills.map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillCategory}>
                                        <Text>
                                            <Text style={styles.skillCategoryName}>{skillGroup.category}: </Text>
                                            <Text>{skillGroup.items.join(', ')}</Text>
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (sectionKey === 'projects' && projects.length > 0) {
                        return (
                            <View key="projects" style={styles.section}>
                                <Text style={styles.sectionHeader}>PROJECTS</Text>
                                {projects.map((project, idx) => (
                                    <View key={idx} style={styles.entryContainer}>
                                        <View style={styles.entryHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.entryTitle}>{project.name}</Text>
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: 10, color: '#0066cc', marginLeft: 6 }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </View>
                                            <Text style={styles.dateRange}>{project.startDate} - {project.endDate}</Text>
                                        </View>
                                        {project.keywords && project.keywords.length > 0 && (
                                            <Text style={styles.projectKeywords}>
                                                {project.keywords.join(', ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View style={{ marginTop: 3 }}>
                                                {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
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
                            <View key="awards" style={styles.section}>
                                <Text style={styles.sectionHeader}>AWARDS</Text>
                                {awards.map((award, idx) => (
                                    <View key={idx} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 11, fontWeight: 'bold' }}>
                                            {award.title}
                                            {award.date && <Text style={{ fontWeight: 'normal' }}> • {award.date}</Text>}
                                        </Text>
                                        {award.awarder && (
                                            <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
                                                ({award.awarder})
                                            </Text>
                                        )}
                                        {award.summary && (
                                            <Text style={{ fontSize: 10, marginTop: 2 }}>
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
