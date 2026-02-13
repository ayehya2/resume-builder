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
    getPDFEntrySpacing,
    getPDFBulletGap,
    getPDFSectionHeaderStyle,
} from '../../lib/pdfFormatting';
import { parseBoldTextPDF } from '../../lib/parseBoldText';

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
            textAlign: formatting.headerAlignment,
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            marginBottom: 4,
        },
        contactInfo: {
            fontSize: baseFontSize - 1,
            color: '#444444',
            marginBottom: 8,
        },
        accentLine: {
            height: 2,
            backgroundColor: accentColor,
            marginBottom: 10,
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: formatting.fontWeightSectionTitle === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            marginBottom: 8,
            letterSpacing: 0.5,
            textDecoration: formatting.sectionTitleUnderline ? 'underline' : 'none',
        },
        entryContainer: {
            marginBottom: getPDFEntrySpacing(formatting.entrySpacing),
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 2,
        },
        entryTitle: {
            fontSize: baseFontSize + 1,
            fontWeight: 'bold',
            color: '#000000',
        },
        dateRange: {
            fontSize: baseFontSize - 1,
            color: '#666666',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#333333',
            marginBottom: 2,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: 1,
            color: '#333333',
            flexDirection: 'row',
        },
        bulletSymbol: {
            marginRight: getPDFBulletGap(formatting.bulletGap),
            color: '#bbbbbb',
        },
        skillRow: {
            fontSize: baseFontSize - 1,
            marginBottom: 4,
            flexDirection: 'row',
        },
        skillCategory: {
            fontWeight: 'bold',
            color: accentColor,
        },
        skillItems: {
            color: '#444444',
        },
    });
};

interface MinimalPDFTemplateProps {
    data: ResumeData;
}

export function MinimalPDFTemplate({ data }: MinimalPDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactInfo}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && ' · '}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && ' · '}
                        {basics.address && basics.address}
                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && ' · '}
                        {basics.websites.map((site, i) => (
                            <Text key={i}>
                                {i > 0 && ' · '}
                                <Link src={site.url} style={{ color: '#444444', textDecoration: 'none' }}>
                                    {site.name || site.url}
                                </Link>
                            </Text>
                        ))}
                    </Text>
                    <View style={styles.accentLine} />
                </View>

                {sections.map((sectionKey) => {
                    if (sectionKey === 'profile' && basics.summary) {
                        return (
                            <View key="profile" style={styles.section}>
                                <Text style={styles.sectionHeader}>Profile</Text>
                                <Text style={{ fontSize: baseFontSize - 1, color: '#444444', lineHeight: 1.6 }}>
                                    {basics.summary}
                                </Text>
                            </View>
                        );
                    }

                    if (sectionKey === 'education' && education.length > 0) {
                        return (
                            <View key="education" style={styles.section}>
                                <Text style={styles.sectionHeader}>Education</Text>
                                {education.map((edu, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{edu.institution}</Text>
                                            <Text style={styles.dateRange}>{edu.graduationDate}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>
                                            {edu.degree}{edu.field && ` in ${edu.field}`}
                                        </Text>
                                        {edu.gpa && <Text style={{ fontSize: baseFontSize - 1, color: '#888888' }}>GPA: {edu.gpa}</Text>}
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
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
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
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                        <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-\*]\s*/, ''), Text)}</Text>
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
                                <Text style={styles.sectionHeader}>Skills</Text>
                                {skills.map((skillGroup, idx) => (
                                    <View key={idx} style={styles.skillRow}>
                                        <Text style={styles.skillCategory}>{skillGroup.category}: </Text>
                                        <Text style={styles.skillItems}>{skillGroup.items.join(', ')}</Text>
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
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>
                                                {project.name}
                                                {project.url && (
                                                    <Text style={{ fontSize: baseFontSize - 1, color: '#888888' }}> </Text>
                                                )}
                                                {project.url && (
                                                    <Link src={project.url} style={{ fontSize: baseFontSize - 1, color: '#888888', textDecoration: 'none' }}>
                                                        [{project.urlName || 'Link'}]
                                                    </Link>
                                                )}
                                            </Text>
                                            <Text style={styles.dateRange}>{project.startDate} — {project.endDate}</Text>
                                        </View>
                                        {project.keywords.length > 0 && (
                                            <Text style={{ fontSize: baseFontSize - 1.5, color: '#999999', marginBottom: 2 }}>
                                                {project.keywords.join(' · ')}
                                            </Text>
                                        )}
                                        {project.bullets && project.bullets.filter(b => b.trim()).length > 0 && (
                                            <View>
                                                {project.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                    <View key={i} style={styles.bulletPoint}>
                                                        <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                        <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-\*]\s*/, ''), Text)}</Text>
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
                                <Text style={styles.sectionHeader}>Awards</Text>
                                {awards.map((award, idx) => (
                                    <View key={idx} style={styles.entryContainer} wrap={true}>
                                        <View style={styles.entryHeader}>
                                            <Text style={styles.entryTitle}>{award.title}</Text>
                                            <Text style={styles.dateRange}>{award.date}</Text>
                                        </View>
                                        <Text style={styles.entrySubtitle}>{award.awarder}</Text>
                                        {award.summary && <Text style={{ fontSize: baseFontSize - 1, color: '#444444' }}>{award.summary}</Text>}
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
