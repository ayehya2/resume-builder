import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CoverLetterData } from '../types';

const styles = StyleSheet.create({
    page: {
        padding: '1in',
        fontFamily: 'Times-Roman',
        fontSize: 11,
        backgroundColor: '#ffffff',
        lineHeight: 1.5,
    },
    userHeader: {
        marginBottom: 20,
    },
    userName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userContact: {
        fontSize: 10,
        color: '#333333',
    },
    date: {
        marginBottom: 20,
        fontSize: 11,
    },
    recipientSection: {
        marginBottom: 20,
    },
    recipientLine: {
        fontSize: 11,
        marginBottom: 2,
    },
    greeting: {
        marginBottom: 15,
        fontSize: 11,
    },
    paragraph: {
        marginBottom: 12,
        fontSize: 11,
        textAlign: 'justify',
    },
    closing: {
        marginTop: 20,
        marginBottom: 40,
        fontSize: 11,
    },
    signature: {
        fontSize: 11,
        fontWeight: 'bold',
    },
});

interface CoverLetterPDFProps {
    data: CoverLetterData;
    documentTitle?: string;
}

export function CoverLetterPDFTemplate({ data, documentTitle }: CoverLetterPDFProps) {
    const { recipientName, recipientTitle, company, companyAddress, date, content, closing, signature, userBasics } = data;

    return (
        <Document title={documentTitle}>
            <Page size="LETTER" style={styles.page}>
                {/* User's contact information header */}
                {userBasics && (
                    <View style={styles.userHeader}>
                        {userBasics.name && <Text style={styles.userName}>{userBasics.name}</Text>}
                        <View style={styles.userContact}>
                            {userBasics.address && <Text>{userBasics.address}</Text>}
                            {userBasics.phone && <Text>{userBasics.phone}</Text>}
                            {userBasics.email && <Text>{userBasics.email}</Text>}
                        </View>
                    </View>
                )}

                {/* Date */}
                {date && <Text style={styles.date}>{date}</Text>}

                {/* Recipient information */}
                <View style={styles.recipientSection}>
                    {recipientName && <Text style={styles.recipientLine}>{recipientName}</Text>}
                    {recipientTitle && <Text style={styles.recipientLine}>{recipientTitle}</Text>}
                    {company && <Text style={styles.recipientLine}>{company}</Text>}
                    {companyAddress && <Text style={styles.recipientLine}>{companyAddress}</Text>}
                </View>

                {/* Content */}
                {content && content.split('\n').map((line, idx) => (
                    // Simple newline handing: if line is empty, it's a break.
                    line.trim() === '' ? (
                        <Text key={idx} style={{ height: 10 }}> </Text>
                    ) : (
                        <Text key={idx} style={styles.paragraph}>{line}</Text>
                    )
                ))}

                {/* Closing */}
                {closing && <Text style={styles.closing}>{closing}</Text>}

                {/* Signature */}
                {signature && <Text style={styles.signature}>{signature}</Text>}
            </Page>
        </Document>
    );
}
