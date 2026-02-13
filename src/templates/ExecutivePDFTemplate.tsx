import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData, FormattingOptions } from '../types';
import {
    getPDFFontFamily,
    getPDFBulletSymbol,
    getPDFColorValue,
    getPDFFontSize,
    getPDFNameSize,
    getPDFSectionTitleSize,
    getPDFSectionMargin,
    getPDFBulletIndent,
    getPDFEntrySpacing,
    getPDFBulletGap,
    getPDFSectionHeaderStyle,
    getPDFSkillSeparator,
    getPDFDateFormat,
    getPDFDateSeparator,
    getPDFBodyTextWeight,
    getPDFParagraphSpacing,
    getPDFSectionTitleSpacing
} from '../lib/pdfFormatting';
import { parseBoldTextPDF } from '../lib/parseBoldText';

const createStyles = (formatting: FormattingOptions) => {
    const accentColor = getPDFColorValue(formatting.colorTheme, formatting.customColor);
    const baseFontSize = getPDFFontSize(formatting.baseFontSize);

    const marginL = parseFloat(String(formatting.marginLeft)) * 72;
    const marginR = parseFloat(String(formatting.marginRight)) * 72;
    const marginT = parseFloat(String(formatting.marginTop)) * 72;
    const marginB = parseFloat(String(formatting.marginBottom)) * 72;

    return StyleSheet.create({
        page: {
            fontFamily: getPDFFontFamily(formatting.fontFamily),
            fontSize: baseFontSize,
            backgroundColor: '#ffffff',
            paddingTop: marginT,
            paddingLeft: marginL,
            paddingRight: marginR,
            paddingBottom: marginB,
            fontWeight: getPDFBodyTextWeight(formatting.bodyTextWeight),
            fontStyle: formatting.italicStyle,
        },
        headerBanner: {
            backgroundColor: '#ffffff',
            paddingBottom: 12,
            marginBottom: 18,
            borderBottom: `2pt solid ${accentColor}`,
            textAlign: formatting.headerAlignment,
        },
        name: {
            fontSize: getPDFNameSize(formatting.nameSize),
            fontWeight: formatting.fontWeightName === 'HEAVY' ? 'bold' : formatting.fontWeightName === 'BOLD' ? 'bold' : 'normal',
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
        },
        contactInfo: {
            fontSize: 9.5,
            color: '#555555',
            letterSpacing: 0.3,
        },
        websiteLink: {
            color: accentColor,
            textDecoration: 'underline',
        },
        body: {
        },
        section: {
            marginBottom: getPDFSectionMargin(formatting.sectionSpacing),
            marginTop: getPDFSectionTitleSpacing(formatting.sectionTitleSpacing),
        },
        sectionHeader: {
            fontSize: getPDFSectionTitleSize(formatting.sectionTitleSize),
            fontWeight: 'bold',
            color: accentColor,
            textTransform: getPDFSectionHeaderStyle(formatting.sectionHeaderStyle),
            letterSpacing: 1,
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: `2pt solid ${accentColor}`,
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
            color: '#1a1a1a',
        },
        dateRange: {
            fontSize: 9,
            color: '#666666',
        },
        entrySubtitle: {
            fontSize: baseFontSize - 1,
            fontStyle: 'italic',
            color: '#444444',
            marginBottom: 3,
        },
        bulletPoint: {
            fontSize: baseFontSize - 1,
            marginLeft: getPDFBulletIndent(formatting.bulletIndent),
            marginBottom: getPDFParagraphSpacing(formatting.paragraphSpacing),
            color: '#1a1a1a',
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
    });
};

interface ExecutivePDFTemplateProps {
    data: ResumeData;
}

export function ExecutivePDFTemplate({ data }: ExecutivePDFTemplateProps) {
    const { basics, work, education, skills, projects, awards, sections, formatting } = data;
    const styles = createStyles(formatting);
    const bulletSymbol = getPDFBulletSymbol(formatting.bulletStyle);

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Dark Banner Header */}
                <View style={styles.headerBanner}>
                    <Text style={styles.name}>{basics.name || 'Your Name'}</Text>
                    <Text style={styles.contactInfo}>
                        {basics.email && basics.email}
                        {basics.email && basics.phone && '  ·  '}
                        {basics.phone && basics.phone}
                        {(basics.email || basics.phone) && basics.address && '  ·  '}
                        {basics.address && basics.address}
                        {(basics.email || basics.phone || basics.address) && basics.websites.length > 0 && '  ·  '}
                        {basics.websites.map((site, i) => (
                            <Text key={i}>
                                {i > 0 && '  ·  '}
                                <Link src={site.url} style={styles.websiteLink}>
                                    {site.name || site.url}
                                </Link>
                            </Text>
                        ))}
                    </Text>
                </View>

                {/* Body */}
                <View style={styles.body}>
                    {sections.map((sectionKey) => {
                        if (sectionKey === 'profile' && basics.summary) {
                            return (
                                <View key="profile" style={styles.section}>
                                    <Text style={styles.sectionHeader}>Professional Summary</Text>
                                    <Text style={{ fontSize: getPDFFontSize(formatting.baseFontSize) - 1, color: '#333333', lineHeight: 1.5 }}>
                                        {parseBoldTextPDF(basics.summary, Text)}
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
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{edu.institution}</Text>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(edu.graduationDate, formatting.dateFormat)}</Text>
                                            </View>
                                            <Text style={styles.entrySubtitle}>
                                                {edu.degree}{edu.field && ` in ${edu.field}`}
                                            </Text>
                                            {formatting.showGPA && edu.gpa && <Text style={{ fontSize: 9, color: '#666666' }}>GPA: {formatting.showGPA && edu.gpa}</Text>}
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
                                                <Text style={{ ...styles.entryTitle, fontWeight: formatting.subHeaderWeight === 'normal' ? 'normal' : 'bold' }}>{formatting.companyTitleOrder === 'title-first' ? job.position : job.company}</Text>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(job.startDate, formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(job.endDate, formatting.dateFormat)}</Text>
                                            </View>
                                            <Text style={styles.entrySubtitle}>
                                                {formatting.companyTitleOrder === 'title-first' ? job.company : job.position}{formatting.showLocation && job.location ? `, ${job.location}` : ''}
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
                                        <View key={idx} style={styles.skillCategory}>
                                            <Text>
                                                <Text style={{ fontWeight: 'bold' }}>{skillGroup.category}: </Text>
                                                <Text style={{ color: '#444444' }}>{skillGroup.items.join(getPDFSkillSeparator(formatting.skillLayout))}</Text>
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
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <Text style={styles.entryTitle}>
                                                    {project.name}
                                                    {project.url && ' '}
                                                    {project.url && (
                                                        <Link src={project.url} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), textDecoration: 'underline' }}>
                                                            [{project.urlName || 'Link'}]
                                                        </Link>
                                                    )}
                                                </Text>
                                                <Text style={styles.dateRange}>{getPDFDateFormat(project.startDate || '', formatting.dateFormat)} {getPDFDateSeparator(formatting.dateSeparator)} {getPDFDateFormat(project.endDate || '', formatting.dateFormat)}</Text>
                                            </View>
                                            {project.keywords.length > 0 && (
                                                <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666666', marginBottom: 2 }}>
                                                    {project.keywords.join(', ')}
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
                                        <View key={idx} style={{ marginBottom: 4 }} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{award.title}</Text>
                                                {award.date && <Text style={styles.dateRange}>{getPDFDateFormat(award.date, formatting.dateFormat)}</Text>}
                                            </View>
                                            {award.awarder && <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#666666' }}>{award.awarder}</Text>}
                                            {formatting.showAwardsSummaries && award.summary && <Text style={{ fontSize: 9, color: '#555555', marginTop: 2 }}>{award.summary}</Text>}
                                        </View>
                                    ))}
                                </View>
                            );
                        }

                        // Custom sections
                        const customSection = data.customSections.find(cs => cs.id === sectionKey);
                        if (customSection && customSection.items && customSection.items.length > 0) {
                            return (
                                <View key={customSection.id} style={styles.section}>
                                    <Text style={styles.sectionHeader}>{customSection.title.toUpperCase()}</Text>
                                    {customSection.items.map((entry, idx) => (
                                        <View key={idx} style={styles.entryContainer} wrap={true}>
                                            <View style={styles.entryHeader}>
                                                <View style={{ flex: 1, paddingRight: 10 }}>
                                                    <Text style={styles.entryTitle}>{entry.title || 'Untitled'}</Text>
                                                    {entry.subtitle && <Text style={styles.entrySubtitle}>{entry.subtitle}</Text>}
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    {entry.date && <Text style={styles.dateRange}>{entry.date}</Text>}
                                                    {entry.location && <Text style={{ fontSize: 9, color: '#333333' }}>{entry.location}</Text>}
                                                </View>
                                            </View>
                                            {entry.link && (
                                                <Link src={entry.link} style={{ fontSize: 9, color: getPDFColorValue(formatting.colorTheme, formatting.customColor), marginBottom: 4, textDecoration: 'underline' }}>
                                                    {entry.link}
                                                </Link>
                                            )}
                                            {customSection.type === 'bullets' ? (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets.filter(b => b.trim()).map((bullet, i) => (
                                                        <View key={i} style={styles.bulletPoint}>
                                                            <Text style={styles.bulletSymbol}>{bulletSymbol}</Text>
                                                            <Text style={{ flex: 1 }}>{parseBoldTextPDF(bullet.replace(/^[•\-\*]\s*/, ''), Text)}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            ) : (
                                                <View style={{ marginTop: 2 }}>
                                                    {entry.bullets.filter(b => b.trim()).map((paragraph, i) => (
                                                        <Text key={i} style={{ fontSize: 10, marginBottom: 4, textAlign: 'justify' }}>
                                                            {paragraph}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            );
                        }

                        return null;
                    })}
                </View>
            </Page>
        </Document>
    );
}
