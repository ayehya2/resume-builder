import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, TemplateId, Basics, WorkExperience, Education, Skill, Project, Award, SectionKey, LaTeXFormattingOptions } from './types';
import { SAMPLE_RESUME_DATA } from './lib/sampleData';

// Default formatting options
export const getDefaultFormatting = (): import('./types').FormattingOptions => ({
    fontFamily: 'default',
    baseFontSize: '11pt',
    nameSize: 'large',
    sectionTitleSize: 'small',
    sectionTitleBold: true,
    sectionTitleUnderline: false,
    lineSpacing: '1.2',
    sectionSpacing: 'normal',
    paragraphSpacing: 'normal',
    pageMargins: 'custom',
    marginTop: '0.6',
    marginBottom: '0.6',
    marginLeft: '0.6',
    marginRight: '0.6',
    // Granular Spacing
    entrySpacing: 'normal',
    bulletSpacing: 'normal',
    bulletGap: '4pt',
    // Typography
    sectionHeaderStyle: 'uppercase',
    fontWeightName: 'BOLD',
    fontWeightSectionTitle: 'BOLD',
    fontWeightBody: 'NORMAL',
    // Decorative
    showIcons: true,
    socialIconStyle: 'none',
    pageFormat: 'Letter',
    bulletStyle: 'bullet',
    bulletIndent: 'none',
    colorTheme: 'black',
    customColor: '#000000',
    separator: '|',
    sectionDividers: 'line',
    headerLineStyle: 'none',
    headerAlignment: 'center',
    // Content Controls (Phase 4)
    dateFormat: 'short',
    subHeaderWeight: 'bold',
    skillLayout: 'comma',
    showLocation: true,
    showGPA: true,
    companyTitleOrder: 'company-first',
    // Phase 4.5 — Extended Formatting
    bodyTextWeight: 'normal',
    italicStyle: 'normal',
    sectionTitleSpacing: 'normal',
    showEducationDescription: true,
    showProjectKeywords: true,
    showAwardsSummaries: true,
    dateSeparator: '—',
    accentColorPosition: 'headers-only',
});

// Default/empty resume data
const getDefaultResumeData = (): ResumeData => ({
    basics: {
        name: '',
        email: '',
        phone: '',
        address: '',
        summary: '',
        websites: [],
    },
    education: [],
    work: [],
    skills: [],
    projects: [],
    awards: [],
    customSections: [],
    sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
    selectedTemplate: 1,
    formatting: getDefaultFormatting(),
});

interface ResumeStore {
    resumeData: ResumeData;
    showResume: boolean;
    activeTab: string;

    setShowResume: (show: boolean) => void;
    setActiveTab: (tab: string) => void;
    customLatexSource: string | null;

    // LaTeX-specific formatting overrides (null = use template defaults)
    latexFormatting: LaTeXFormattingOptions | null;

    // Basics
    updateBasics: (basics: Partial<Basics>) => void;

    // Work Experience
    addWork: () => void;
    updateWork: (index: number, work: Partial<WorkExperience>) => void;
    removeWork: (index: number) => void;

    // Education
    addEducation: () => void;
    updateEducation: (index: number, education: Partial<Education>) => void;
    removeEducation: (index: number) => void;

    // Skills
    addSkill: () => void;
    updateSkill: (index: number, skill: Partial<Skill>) => void;
    removeSkill: (index: number) => void;

    // Projects
    addProject: () => void;
    updateProject: (index: number, project: Partial<Project>) => void;
    removeProject: (index: number) => void;

    // Awards
    addAward: () => void;
    updateAward: (index: number, award: Partial<Award>) => void;
    removeAward: (index: number) => void;

    // Custom Sections
    addCustomSection: (id?: string) => string;
    updateCustomSection: (id: string, section: Partial<import('./types').CustomSection>) => void;
    removeCustomSection: (id: string) => void;
    addCustomSectionItem: (sectionId: string) => void;
    updateCustomSectionItem: (sectionId: string, index: number, item: Partial<import('./types').CustomSectionEntry>) => void;
    removeCustomSectionItem: (sectionId: string, index: number) => void;

    // Sections
    setSections: (sections: SectionKey[]) => void;

    // Template
    setTemplate: (templateId: TemplateId) => void;

    // Formatting
    updateFormatting: (formatting: Partial<import('./types').FormattingOptions>) => void;
    resetFormatting: () => void;

    // LaTeX
    setCustomLatex: (source: string) => void;
    clearCustomLatex: () => void;
    updateLatexFormatting: (formatting: Partial<LaTeXFormattingOptions>) => void;
    resetLatexFormatting: () => void;

    // Utility
    loadSampleData: () => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set) => ({
            resumeData: getDefaultResumeData(),
            showResume: true,
            activeTab: 'basics',
            customLatexSource: null,
            latexFormatting: null,

            setShowResume: (show) => set({ showResume: show }),
            setActiveTab: (tab) => set({ activeTab: tab }),

            // Basics
            updateBasics: (basics) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        basics: { ...state.resumeData.basics, ...basics },
                    },
                })),

            // Work Experience
            addWork: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: [
                            ...state.resumeData.work,
                            {
                                company: '',
                                position: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                bullets: [''],
                            },
                        ],
                    },
                })),

            updateWork: (index, work) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: state.resumeData.work.map((item, i) =>
                            i === index ? { ...item, ...work } : item
                        ),
                    },
                })),

            removeWork: (index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        work: state.resumeData.work.filter((_, i) => i !== index),
                    },
                })),

            // Education
            addEducation: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: [
                            ...state.resumeData.education,
                            {
                                institution: '',
                                degree: '',
                                field: '',
                                location: '',
                                graduationDate: '',
                            },
                        ],
                    },
                })),

            updateEducation: (index, education) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: state.resumeData.education.map((item, i) =>
                            i === index ? { ...item, ...education } : item
                        ),
                    },
                })),

            removeEducation: (index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        education: state.resumeData.education.filter((_, i) => i !== index),
                    },
                })),

            // Skills
            addSkill: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: [
                            ...state.resumeData.skills,
                            { category: '', items: [] },
                        ],
                    },
                })),

            updateSkill: (index, skill) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: state.resumeData.skills.map((item, i) =>
                            i === index ? { ...item, ...skill } : item
                        ),
                    },
                })),

            removeSkill: (index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        skills: state.resumeData.skills.filter((_, i) => i !== index),
                    },
                })),

            // Projects
            addProject: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: [
                            ...state.resumeData.projects,
                            {
                                name: '',
                                bullets: [''],
                                keywords: [],
                            },
                        ],
                    },
                })),

            updateProject: (index, project) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: state.resumeData.projects.map((item, i) =>
                            i === index ? { ...item, ...project } : item
                        ),
                    },
                })),

            removeProject: (index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        projects: state.resumeData.projects.filter((_, i) => i !== index),
                    },
                })),

            // Awards
            addAward: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: [
                            ...state.resumeData.awards,
                            {
                                title: '',
                                awarder: '',
                                date: '',
                            },
                        ],
                    },
                })),

            updateAward: (index, award) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: state.resumeData.awards.map((item, i) =>
                            i === index ? { ...item, ...award } : item
                        ),
                    },
                })),

            removeAward: (index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        awards: state.resumeData.awards.filter((_, i) => i !== index),
                    },
                })),

            // Custom Sections
            addCustomSection: (id) => {
                const newId = id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newSection: import('./types').CustomSection = {
                    id: newId,
                    title: 'Custom Section',
                    type: 'bullets',
                    items: [
                        {
                            title: '',
                            subtitle: '',
                            date: '',
                            location: '',
                            link: '',
                            bullets: [''],
                        },
                    ],
                };
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: [...state.resumeData.customSections, newSection],
                        sections: [...state.resumeData.sections, newSection.id],
                    },
                }));
                return newId;
            },

            updateCustomSection: (id, section) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((item) =>
                            item.id === id ? { ...item, ...section } : item
                        ),
                    },
                })),

            removeCustomSection: (id) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.filter((item) => item.id !== id),
                        sections: state.resumeData.sections.filter((s) => s !== id),
                    },
                })),

            addCustomSectionItem: (sectionId) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: [
                                        ...section.items,
                                        {
                                            title: '',
                                            subtitle: '',
                                            date: '',
                                            location: '',
                                            link: '',
                                            bullets: [''],
                                        },
                                    ],
                                }
                                : section
                        ),
                    },
                })),

            updateCustomSectionItem: (sectionId, index, item) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: section.items.map((entry, i) =>
                                        i === index ? { ...entry, ...item } : entry
                                    ),
                                }
                                : section
                        ),
                    },
                })),

            removeCustomSectionItem: (sectionId, index) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        customSections: state.resumeData.customSections.map((section) =>
                            section.id === sectionId
                                ? {
                                    ...section,
                                    items: section.items.filter((_, i) => i !== index),
                                }
                                : section
                        ),
                    },
                })),

            // Sections
            setSections: (sections) =>
                set((state) => {
                    // Allow standard sections and custom section IDs
                    const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
                    const customSectionIds = state.resumeData.customSections.map(s => s.id);
                    const validSections = [...standardSections, ...customSectionIds];

                    const uniqueSections = Array.from(new Set(sections)).filter(s =>
                        validSections.includes(s)
                    );
                    return {
                        resumeData: {
                            ...state.resumeData,
                            sections: uniqueSections,
                        },
                    };
                }),

            // Template
            setTemplate: (templateId) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        selectedTemplate: templateId,
                    },
                })),

            // Formatting
            updateFormatting: (formatting) =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        formatting: { ...state.resumeData.formatting, ...formatting },
                    },
                })),

            resetFormatting: () =>
                set((state) => ({
                    resumeData: {
                        ...state.resumeData,
                        formatting: getDefaultResumeData().formatting,
                    },
                })),

            // LaTeX
            setCustomLatex: (source) =>
                set({ customLatexSource: source }),

            clearCustomLatex: () =>
                set({ customLatexSource: null }),

            updateLatexFormatting: (formatting) =>
                set((state) => ({
                    latexFormatting: {
                        ...(state.latexFormatting || {
                            fontSize: '11pt',
                            margins: '0.75in',
                            lineSpacing: '1.15',
                            sectionSpaceBefore: '12pt',
                            sectionSpaceAfter: '6pt',
                            itemSep: '6pt',
                            bulletItemSep: '0pt',
                            headerSize: 'Huge',
                            sectionTitleSize: 'large',
                        }),
                        ...formatting,
                    } as LaTeXFormattingOptions,
                    customLatexSource: null, // Reset custom source when formatting changes
                })),

            resetLatexFormatting: () =>
                set({ latexFormatting: null, customLatexSource: null }),

            loadSampleData: () => {
                set((state) => ({
                    resumeData: {
                        ...SAMPLE_RESUME_DATA,
                        selectedTemplate: state.resumeData.selectedTemplate,
                        formatting: state.resumeData.formatting,
                    },
                }));
            },

            reset: () => set({ resumeData: getDefaultResumeData() }),
        }),
        {
            name: 'resume-builder-data',
            merge: (persistedState: any, currentState: ResumeStore) => {
                if (!persistedState) return currentState;
                const persisted = persistedState as ResumeStore;
                const data = persisted.resumeData;

                // Migrate old custom sections (content → items)
                if (data?.customSections) {
                    data.customSections = data.customSections.map((section: any) => {
                        if (section.content) {
                            const newItems = section.content.map((c: string) => ({
                                title: '', subtitle: '', date: '', location: '', link: '', bullets: [c],
                            }));
                            const { content: _content, ...rest } = section;
                            return { ...rest, items: newItems.length > 0 ? newItems : [{ title: '', subtitle: '', date: '', location: '', link: '', bullets: [''] }] };
                        }
                        return section;
                    });
                }

                // Deduplicate sections
                if (data?.sections) {
                    const standardSections = ['profile', 'education', 'work', 'skills', 'projects', 'awards'];
                    const customIds = (data.customSections || []).map((cs: any) => cs.id);
                    data.sections = Array.from(new Set(data.sections)).filter((s: any) =>
                        standardSections.includes(s) || customIds.includes(s)
                    );
                }

                return { ...currentState, ...persisted, resumeData: { ...currentState.resumeData, ...data, formatting: { ...currentState.resumeData.formatting, ...(data?.formatting || {}) } } };
            },
        },
    ),
);
