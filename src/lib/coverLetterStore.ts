import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverLetterData, Basics, TemplateId, FormattingOptions } from '../types';
import { getDefaultFormatting } from '../store';
import { SAMPLE_COVER_LETTER_DATA } from './sampleData';

const getDefaultCoverLetterData = (): CoverLetterData => ({
    recipientName: '',
    recipientTitle: '',
    company: '',
    companyAddress: '',
    position: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    content: 'I am writing to express my strong interest in the [Position] role at [Company]. I have a solid background in [Your Field] and I am confident that my skills and experiences make me an ideal candidate for this opportunity.',
    closing: 'Sincerely',
    signature: '',
    selectedTemplate: 24, // Classic CV React PDF
    formatting: getDefaultFormatting(),
});

interface CoverLetterStore {
    coverLetterData: CoverLetterData;
    showCoverLetter: boolean;

    updateRecipient: (data: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => void;
    updatePosition: (position: string) => void;
    updateDate: (date: string) => void;
    updateContent: (content: string) => void;
    updateClosing: (closing: string) => void;
    updateSignature: (signature: string) => void;
    setTemplate: (templateId: TemplateId) => void;
    updateFormatting: (formatting: Partial<FormattingOptions>) => void;
    resetFormatting: () => void;

    setShowCoverLetter: (show: boolean) => void;
    autoPopulateFromResume: (basics: Basics) => void;
    loadSampleData: () => void;
    reset: () => void;
}

export const useCoverLetterStore = create<CoverLetterStore>()(
    persist(
        (set) => ({
            coverLetterData: getDefaultCoverLetterData(),
            showCoverLetter: true,

            updateRecipient: (data) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, ...data },
                })),

            updatePosition: (position) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, position },
                })),

            updateDate: (date) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, date },
                })),

            updateContent: (content) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, content },
                })),

            updateClosing: (closing) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, closing },
                })),

            updateSignature: (signature) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, signature },
                })),

            setTemplate: (templateId) =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, selectedTemplate: templateId },
                })),

            updateFormatting: (formatting) =>
                set((state) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        formatting: { ...state.coverLetterData.formatting, ...formatting },
                    },
                })),

            resetFormatting: () =>
                set((state) => ({
                    coverLetterData: { ...state.coverLetterData, formatting: getDefaultFormatting() },
                })),

            setShowCoverLetter: (show) => set({ showCoverLetter: show }),

            autoPopulateFromResume: (basics) =>
                set((state) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        signature: basics.name,
                        userBasics: basics,
                    },
                })),

            loadSampleData: () => {
                set((state) => ({
                    coverLetterData: {
                        ...SAMPLE_COVER_LETTER_DATA,
                        selectedTemplate: state.coverLetterData.selectedTemplate,
                        formatting: state.coverLetterData.formatting,
                    },
                }));
            },

            reset: () => set({ coverLetterData: getDefaultCoverLetterData() }),
        }),
        {
            name: 'cover-letter-data',
        }
    )
);
