import { create } from 'zustand';
import type { ResumeData, TemplateId, Basics, WorkExperience, Education, Skill, Project, Award, SectionKey } from './types';

// Default/empty resume data
const getDefaultResumeData = (): ResumeData => ({
    basics: {
        name: '',
        email: '',
        phone: '',
        address: '',
        websites: [],
    },
    education: [],
    work: [],
    skills: [],
    projects: [],
    awards: [],
    sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
    selectedTemplate: 1,
    formatting: {
        fontFamily: 'default',
        baseFontSize: '11pt',
        nameSize: 'large',
        sectionTitleSize: 'small',
        sectionTitleBold: true,
        sectionTitleUnderline: false,
        lineSpacing: '1.0',
        sectionSpacing: 'tight',
        paragraphSpacing: 'tight',
        pageMargins: 'custom',
        marginTop: '0.25',
        marginBottom: '0.25',
        marginLeft: '0.25',
        marginRight: '0.25',
        bulletStyle: 'bullet',
        bulletIndent: 'none',
        bulletSpacing: 'normal',
        colorTheme: 'black',
        customColor: '#000000',
        separator: '|',
        sectionDividers: 'line',
        headerLineStyle: 'none',
        headerAlignment: 'center',
    },
});

interface ResumeStore {
    resumeData: ResumeData;

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

    // Sections
    setSections: (sections: SectionKey[]) => void;

    // Template
    setTemplate: (templateId: TemplateId) => void;

    // Formatting
    updateFormatting: (formatting: Partial<import('./types').FormattingOptions>) => void;
    resetFormatting: () => void;

    // Utility
    loadSampleData: () => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
    resumeData: getDefaultResumeData(),

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

    // Sections
    setSections: (sections) =>
        set((state) => ({
            resumeData: {
                ...state.resumeData,
                sections,
            },
        })),

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

    // Utility
    loadSampleData: () => {
        set({
            resumeData: {
                ...getDefaultResumeData(),
                basics: {
                    name: 'Sarah Mitchell',
                    email: 'sarah.mitchell@email.com',
                    phone: '(555) 123-4567',
                    address: 'San Francisco, CA',
                    websites: [
                        { name: 'LinkedIn', url: 'https://linkedin.com/in/sarahmitchell' },
                        { name: 'GitHub', url: 'https://github.com/sarahmitchell' },
                        { name: 'Portfolio', url: 'https://sarahmitchell.dev' },
                    ],
                },
                work: [
                    {
                        company: 'TechVision Inc.',
                        position: 'Senior Software Engineer',
                        location: 'San Francisco, CA',
                        startDate: 'Jan 2021',
                        endDate: 'Present',
                        bullets: [
                            'Led development of microservices architecture serving 5M+ daily users, reducing API response time by 40%',
                            'Architected and implemented real-time data processing pipeline using Apache Kafka and Spark',
                            'Mentored team of 6 junior developers, conducting code reviews and technical design sessions',
                            'Reduced cloud infrastructure costs by 30% through optimization and auto-scaling strategies',
                            'Championed adoption of CI/CD practices, reducing deployment time from 2 hours to 15 minutes',
                        ],
                    },
                    {
                        company: 'DataFlow Solutions',
                        position: 'Software Engineer',
                        location: 'Seattle, WA',
                        startDate: 'Jun 2018',
                        endDate: 'Dec 2020',
                        bullets: [
                            'Developed RESTful APIs and GraphQL endpoints for customer-facing analytics dashboard',
                            'Implemented automated testing suite achieving 95% code coverage across 50+ microservices',
                            'Collaborated with product team to design and launch 3 major features with 200K+ active users',
                            'Optimized database queries reducing load times by 60% for key user workflows',
                        ],
                    },
                ],
                education: [
                    {
                        institution: 'University of California, Berkeley',
                        degree: 'Bachelor of Science',
                        field: 'Computer Science',
                        location: 'Berkeley, CA',
                        graduationDate: 'May 2016',
                        gpa: '3.85',
                    },
                ],
                skills: [
                    {
                        category: 'Languages',
                        items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'SQL'],
                    },
                    {
                        category: 'Frameworks',
                        items: ['React', 'Next.js', 'Node.js', 'Express', 'GraphQL'],
                    },
                    {
                        category: 'Tools',
                        items: ['Docker', 'Kubernetes', 'AWS', 'Git', 'Terraform'],
                    },
                ],
                projects: [
                    {
                        name: 'E-Commerce Platform',
                        url: 'https://github.com/sarahmitchell/ecommerce',
                        urlName: 'GitHub',
                        startDate: 'Jan 2023',
                        endDate: 'Present',
                        keywords: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
                        bullets: [
                            'Built full-stack e-commerce platform with product catalog, shopping cart, and payment integration',
                            'Implemented secure payment processing with Stripe API handling $100K+ in transactions',
                        ],
                    },
                ],
                awards: [
                    {
                        title: 'Employee of the Year',
                        awarder: 'TechVision Inc.',
                        date: 'Dec 2022',
                        summary: 'Recognized for outstanding technical leadership and mentorship',
                    },
                ],
            },
        });
    },

    reset: () => set({ resumeData: getDefaultResumeData() }),
}));
