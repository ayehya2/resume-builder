// Core Resume Data Types
export interface ResumeData {
    basics: Basics;
    education: Education[];
    work: WorkExperience[];
    skills: Skill[];
    projects: Project[];
    awards: Award[];
    sections: SectionKey[];
    selectedTemplate: TemplateId;
    formatting: FormattingOptions;
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
export type TemplateId = 1 | 2 | 4 | 8;
export type SectionKey = 'profile' | 'education' | 'work' | 'skills' | 'projects' | 'awards';

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
    bulletStyle: BulletStyle;
    bulletIndent: BulletIndent;
    bulletSpacing: Spacing;
    colorTheme: ColorTheme;
    customColor: string;
    sectionDividers: SectionDivider;
    headerLineStyle: HeaderLineStyle;
    headerAlignment: Alignment;
    separator: '•' | '|'; // Universal separator for contact info and lists
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
