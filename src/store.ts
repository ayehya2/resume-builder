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
        separator: '•',
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
        sectionTitleSize: 'normal',
        sectionTitleBold: true,
        sectionTitleUnderline: true,
        lineSpacing: '1.0',
        sectionSpacing: 'normal',
        paragraphSpacing: 'normal',
        pageMargins: 'normal',
        marginTop: '0.8',
        marginBottom: '0.8',
        marginLeft: '0.8',
        marginRight: '0.8',
        bulletStyle: 'bullet',
        bulletSpacing: 'normal',
        colorTheme: 'black',
        customColor: '#000000',
        sectionDividers: 'line',
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
                        description: '',
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
                        description: '',
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

    // Utility
    loadSampleData: () =>
        set({
            resumeData: {
                ...getDefaultResumeData(),
                basics: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '(123) 456-7890',
                    address: 'New York, NY',
                    separator: '•',
                    websites: [
                        { name: 'Portfolio', url: 'https://johndoe.com' },
                        { name: 'GitHub', url: 'https://github.com/johndoe' },
                    ],
                },
                work: [
                    {
                        company: 'Tech Solutions Inc.',
                        position: 'Senior Software Engineer',
                        location: 'San Francisco, CA',
                        startDate: 'Jan 2020',
                        endDate: 'Present',
                        description: '• Led team of 5 developers\n• Improved performance by 40%',
                    },
                ],
                education: [
                    {
                        institution: 'University of Technology',
                        degree: 'Bachelor of Science',
                        field: 'Computer Science',
                        location: 'Boston, MA',
                        graduationDate: 'May 2017',
                        gpa: '3.8/4.0',
                    },
                ],
                skills: [
                    { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java'] },
                    { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js'] },
                ],
                projects: [
                    {
                        name: 'E-commerce Platform',
                        description: '• Built full-stack e-commerce site\n• Implemented payment processing',
                        keywords: ['React', 'Node.js', 'Stripe'],
                    },
                ],
                awards: [
                    {
                        title: 'Employee of the Month',
                        awarder: 'Tech Solutions Inc.',
                        date: 'May 2022',
                    },
                ],
            },
        }),

    reset: () => set({ resumeData: getDefaultResumeData() }),
}));
