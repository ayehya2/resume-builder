// Core Resume Data Types
export interface ResumeData {
    basics: Basics;
    education: Education[];
    work: WorkExperience[];
    skills: Skill[];
    projects: Project[];
    awards: Award[];
    customSections: CustomSection[];
    sections: SectionKey[];
    selectedTemplate: TemplateId;
    formatting: FormattingOptions;
}

export interface CustomSectionEntry {
    title: string;
    subtitle: string;
    date: string;
    location: string;
    link: string;
    bullets: string[];
}

export interface CustomSection {
    id: string;
    title: string;
    type: 'bullets' | 'text';
    items: CustomSectionEntry[];
}

export interface Basics {
    name: string;
    email: string;
    phone: string;
    address: string;
    websites: Website[];
}

export interface Website {
    name: string;
    url: string;
}

export interface WorkExperience {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    description?: string;
}

export interface Skill {
    category: string;
    items: string[];
}

export interface Project {
    name: string;
    bullets: string[];
    keywords: string[];
    url?: string;
    urlName?: string;
    startDate?: string;
    endDate?: string;
}

export interface Award {
    title: string;
    awarder: string;
    date: string;
    summary?: string;
}

// Template Types
export type TemplateId = 1 | 2 | 3 | 4;
export type SectionKey = 'profile' | 'education' | 'work' | 'skills' | 'projects' | 'awards' | string;

export interface TemplateMetadata {
    id: TemplateId;
    name: string;
    description: string;
    previewImage: string;
}

export interface TemplateProps {
    data: ResumeData;
}

// Formatting Types
export interface FormattingOptions {
    fontFamily: FontFamily;
    baseFontSize: string;
    nameSize: NameSize;
    sectionTitleSize: SectionTitleSize;
    sectionTitleBold: boolean;
    sectionTitleUnderline: boolean;
    lineSpacing: string;
    sectionSpacing: Spacing;
    paragraphSpacing: Spacing;
    pageMargins: PageMargins;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    // Granular Spacing
    entrySpacing: Spacing;
    bulletSpacing: Spacing;
    bulletGap: string; // spacing between bullet and text
    // Typography
    sectionHeaderStyle: 'uppercase' | 'capitalize' | 'normal';
    fontWeightName: string;
    fontWeightSectionTitle: string;
    fontWeightBody: string;
    // Decorative
    showIcons: boolean;
    socialIconStyle: 'circle' | 'square' | 'none';
    pageFormat: 'Letter' | 'A4';
    bulletStyle: BulletStyle;
    bulletIndent: BulletIndent;
    colorTheme: ColorTheme;
    customColor: string;
    sectionDividers: SectionDivider;
    headerLineStyle: HeaderLineStyle;
    headerAlignment: Alignment;
    separator: '•' | '|' | '·' | '—'; // Universal separator for contact info and lists
}

export type FontFamily = 'default' | 'times' | 'arial' | 'calibri' | 'georgia' | 'helvetica' | 'palatino' | 'garamond';
export type NameSize = 'huge' | 'large' | 'large2' | 'normal';
export type SectionTitleSize = 'large' | 'normal' | 'small';
export type Spacing = 'tight' | 'normal' | 'relaxed' | 'spacious';
export type PageMargins = 'narrow' | 'normal' | 'wide' | 'custom';
export type BulletStyle = 'bullet' | 'dash' | 'arrow' | 'circle' | 'square' | 'diamond' | 'star' | 'chevron';
export type BulletIndent = 'none' | 'small' | 'medium' | 'large';
export type ColorTheme = 'black' | 'navy' | 'darkblue' | 'darkgreen' | 'maroon' | 'purple' | 'custom';
export type SectionDivider = 'none' | 'line' | 'double' | 'thick' | 'dotted';
export type HeaderLineStyle = 'none' | 'thin' | 'medium' | 'thick' | 'double' | 'dotted' | 'dashed';
export type Alignment = 'left' | 'center' | 'right';

// API Types
export interface GeneratePDFRequest {
    resumeData: ResumeData;
}

export interface GeneratePDFResponse {
    success: boolean;
    pdfUrl?: string;
    error?: string;
}

// Cover Letter Types
export interface CoverLetterData {
    recipientName: string;
    recipientTitle: string;
    company: string;
    companyAddress: string;
    position: string;
    date: string;
    greeting: string;
    opening: string;
    body: string[];
    closing: string;
    signature: string;
    // Reference to resume basics for auto-population
    userBasics?: Basics;
}

// Document Type
export type DocumentType = 'resume' | 'coverletter';

// AI Configuration
export interface AIConfig {
    apiKey: string;
    isConfigured: boolean;
}
