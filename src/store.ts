import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, TemplateId, Basics, WorkExperience, Education, Skill, Project, Award, SectionKey } from './types';

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
    formatting: {
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

    // Utility
    loadSampleData: () => void;
    reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set) => ({
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

            loadSampleData: () => {
                set({
                    resumeData: {
                        ...getDefaultResumeData(),
                        sections: ['profile', 'education', 'work', 'skills', 'projects', 'awards'],
                        basics: {
                            name: 'Sarah J. Mitchell',
                            email: 'sarah.mitchell@email.com',
                            phone: '(415) 892-3047',
                            address: 'San Francisco, CA 94102',
                            summary: 'Staff Software Engineer with 8+ years of experience building scalable distributed systems and high-frequency data pipelines. Proven track record of leading cross-functional teams to deliver critical infrastructure projects at companies like Stripe and Airbnb. Expert in Go, TypeScript, and cloud-native architectures.',
                            websites: [
                                { name: 'LinkedIn', url: 'https://linkedin.com/in/sarahjmitchell' },
                                { name: 'GitHub', url: 'https://github.com/sarahmitchell' },
                                { name: 'Portfolio', url: 'https://sarahmitchell.dev' },
                            ],
                        },
                        work: [
                            {
                                company: 'Stripe',
                                position: 'Staff Software Engineer',
                                location: 'San Francisco, CA',
                                startDate: 'Mar 2023',
                                endDate: 'Present',
                                bullets: [
                                    'Architected and led the migration of the payments orchestration layer from a monolithic Ruby service to a distributed Go-based microservices architecture, reducing p99 latency from 340ms to 87ms and increasing throughput by 4.2x',
                                    'Designed a real-time fraud detection pipeline processing 12M+ transactions daily using Apache Kafka, Flink, and custom ML scoring models, reducing fraudulent charges by $18M annually',
                                    'Spearheaded the adoption of OpenTelemetry across 47 production services, achieving 99.8% trace coverage and reducing mean-time-to-resolution (MTTR) from 45 minutes to 8 minutes',
                                    'Led a cross-functional team of 12 engineers, 2 PMs, and 3 designers to deliver the new Connect Express onboarding flow, increasing merchant conversion by 23% and generating $4.7M in incremental ARR',
                                    'Established and mentored an internal architecture guild of 18 senior engineers, authoring 6 RFCs that shaped company-wide infrastructure standards',
                                ],
                            },
                            {
                                company: 'Airbnb',
                                position: 'Senior Software Engineer',
                                location: 'San Francisco, CA',
                                startDate: 'Aug 2020',
                                endDate: 'Feb 2023',
                                bullets: [
                                    'Rebuilt the search ranking infrastructure serving 150M+ monthly active users, implementing a multi-stage retrieval and re-ranking pipeline with TensorFlow Serving that improved booking conversion by 11.4%',
                                    'Designed and deployed a globally distributed caching layer using Redis Cluster and CDN edge caching, reducing search API response times from 1.2s to 180ms and saving $2.3M annually in compute costs',
                                    'Developed an A/B testing framework supporting 200+ concurrent experiments across web and mobile platforms, processing 8B+ events per day with less than 0.1% data loss',
                                    'Led the backend migration for the Experiences marketplace from Python 2 to Go, improving request throughput by 6x while maintaining 99.99% uptime during the 14-week transition',
                                    'Mentored 8 junior and mid-level engineers through structured 1-on-1s, code reviews, and design sessions; 5 received promotions within 18 months',
                                ],
                            },
                            {
                                company: 'Datadog',
                                position: 'Software Engineer II',
                                location: 'New York, NY',
                                startDate: 'Jun 2018',
                                endDate: 'Jul 2020',
                                bullets: [
                                    'Built the custom metrics ingestion pipeline handling 2.8 trillion data points per day using Go microservices, Apache Kafka, and ClickHouse, achieving sub-second query latency on 90-day retention windows',
                                    'Implemented automated anomaly detection algorithms using statistical methods (DBSCAN, Isolation Forest) that surfaced 94% of customer-reported incidents before users noticed, reducing alert noise by 62%',
                                    'Developed the public GraphQL API used by 3,200+ enterprise customers, implementing rate limiting, field-level authorization, and query complexity analysis to ensure platform stability',
                                    'Optimized the dashboards rendering engine, reducing initial load time from 4.7s to 1.1s through virtual scrolling, incremental hydration, and WebSocket-based live data streaming',
                                ],
                            },
                            {
                                company: 'JPMorgan Chase & Co.',
                                position: 'Software Engineer',
                                location: 'New York, NY',
                                startDate: 'Jul 2016',
                                endDate: 'May 2018',
                                bullets: [
                                    'Developed real-time risk calculation systems for the equities trading desk, processing $4.2B in daily trade volume across 12,000+ financial instruments using Java, Spring Boot, and KDB+',
                                    'Built an internal portfolio analytics dashboard used by 340+ traders and risk managers, visualizing P&L, VaR, and Greeks calculations with sub-200ms refresh intervals using React and D3.js',
                                    'Automated the end-of-day reconciliation process for 3 business units, reducing manual effort from 6 hours to 12 minutes and eliminating $1.8M in annual reconciliation discrepancies',
                                    'Implemented SOX-compliant audit logging across 28 microservices using Apache Kafka and Elasticsearch, processing 45M+ audit events daily with 7-year configurable retention',
                                ],
                            },
                        ],
                        education: [
                            {
                                institution: 'Stanford University',
                                degree: 'Master of Science',
                                field: 'Computer Science — Systems & Distributed Computing',
                                location: 'Stanford, CA',
                                graduationDate: 'Jun 2016',
                                gpa: '3.92',
                                description: 'Thesis: "Adaptive Load Balancing in Heterogeneous Distributed Systems" — Published at ACM SIGCOMM 2016. Coursework: Advanced Operating Systems, Distributed Systems, Machine Learning, Computer Architecture.',
                            },
                            {
                                institution: 'University of Michigan, Ann Arbor',
                                degree: 'Bachelor of Science in Engineering',
                                field: 'Computer Science — Honors',
                                location: 'Ann Arbor, MI',
                                graduationDate: 'May 2014',
                                gpa: '3.87',
                                description: 'Dean\'s List all semesters. Teaching Assistant for EECS 482 (Operating Systems). President of Women in Computer Science. Coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Operating Systems, Compilers.',
                            },
                        ],
                        skills: [
                            {
                                category: 'Languages',
                                items: ['Go', 'TypeScript', 'Python', 'Java', 'Rust', 'SQL', 'Ruby', 'C++'],
                            },
                            {
                                category: 'Backend & Infrastructure',
                                items: ['gRPC', 'GraphQL', 'REST', 'Apache Kafka', 'Redis', 'PostgreSQL', 'ClickHouse', 'Elasticsearch', 'MongoDB'],
                            },
                            {
                                category: 'Frontend & UI',
                                items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'D3.js', 'WebSockets', 'Service Workers'],
                            },
                            {
                                category: 'Cloud & DevOps',
                                items: ['AWS (EC2, EKS, S3, Lambda, DynamoDB)', 'GCP (GKE, BigQuery)', 'Docker', 'Kubernetes', 'Terraform', 'Datadog', 'PagerDuty', 'ArgoCD'],
                            },
                            {
                                category: 'Practices & Methodologies',
                                items: ['System Design', 'Distributed Systems', 'CI/CD', 'Observability', 'A/B Testing', 'Agile/Scrum', 'Technical Leadership', 'RFC Authoring'],
                            },
                        ],
                        projects: [
                            {
                                name: 'Distributed Key-Value Store',
                                url: 'https://github.com/sarahmitchell/kv-store',
                                urlName: 'GitHub',
                                startDate: 'Sep 2023',
                                endDate: 'Present',
                                keywords: ['Rust', 'Raft Consensus', 'gRPC', 'Tokio', 'RocksDB'],
                                bullets: [
                                    'Built a fault-tolerant distributed key-value store implementing the Raft consensus protocol in Rust, supporting linearizable reads and writes across a 5-node cluster with automatic leader election',
                                    'Achieved 142,000 writes/second and 380,000 reads/second on commodity hardware with 99th percentile latency under 4ms, validated through custom load testing framework',
                                    'Implemented log compaction, snapshotting, and dynamic cluster membership changes supporting zero-downtime rolling upgrades',
                                ],
                            },
                            {
                                name: 'Real-Time Collaborative Code Editor',
                                url: 'https://github.com/sarahmitchell/collab-editor',
                                urlName: 'GitHub',
                                startDate: 'Mar 2022',
                                endDate: 'Aug 2022',
                                keywords: ['TypeScript', 'CRDT', 'WebSocket', 'React', 'Monaco Editor'],
                                bullets: [
                                    'Developed a Google Docs-style collaborative code editor supporting 50+ simultaneous users per document using Conflict-free Replicated Data Types (CRDTs) for eventual consistency',
                                    'Implemented syntax highlighting for 30+ programming languages, integrated terminal emulation, and live cursor presence indicators with sub-100ms synchronization latency',
                                    'Deployed on AWS using EKS with horizontal pod autoscaling, handling 12,000+ concurrent WebSocket connections per node',
                                ],
                            },
                            {
                                name: 'Open-Source Observability Toolkit',
                                url: 'https://github.com/sarahmitchell/obs-toolkit',
                                urlName: 'GitHub',
                                startDate: 'Jan 2021',
                                endDate: 'Dec 2021',
                                keywords: ['Go', 'OpenTelemetry', 'Prometheus', 'Grafana', 'eBPF'],
                                bullets: [
                                    'Created an open-source observability toolkit that auto-instruments Go applications using eBPF probes, capturing distributed traces, metrics, and logs without code changes — 2,400+ GitHub stars',
                                    'Built a custom Prometheus exporter that reduced metric cardinality by 73% through intelligent label aggregation, saving teams an average of $800/month in monitoring costs',
                                ],
                            },
                        ],
                        awards: [
                            {
                                title: 'Engineering Excellence Award',
                                awarder: 'Stripe',
                                date: 'Dec 2024',
                                summary: 'Awarded to top 2% of engineers company-wide for exceptional impact on the payments orchestration migration and fraud detection platform',
                            },
                            {
                                title: 'Best Paper — Adaptive Load Balancing in Heterogeneous Distributed Systems',
                                awarder: 'ACM SIGCOMM 2016',
                                date: 'Aug 2016',
                                summary: 'Research paper selected as Best Paper out of 342 submissions, proposing a novel adaptive load balancing algorithm that improved throughput by 38% over existing approaches in heterogeneous cloud environments',
                            },
                            {
                                title: 'Grace Hopper Celebration Scholar',
                                awarder: 'AnitaB.org',
                                date: 'Oct 2015',
                                summary: 'Selected as one of 450 scholars (from 4,800+ applicants) for demonstrated leadership in advancing women in computing through research and community organizing',
                            },
                        ],
                    },
                });
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

                return { ...currentState, ...persisted, resumeData: { ...currentState.resumeData, ...data } };
            },
        },
    ),
);
