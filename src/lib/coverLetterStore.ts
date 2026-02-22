import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoverLetterData } from '../types';
import { getDefaultFormatting } from '../store';
import { SAMPLE_COVER_LETTER_DATA } from './sampleData';

interface CoverLetterStore {
    coverLetterData: CoverLetterData;
    showCoverLetter: boolean;

    setShowCoverLetter: (show: boolean) => void;
    updateRecipient: (recipient: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => void;
    updatePosition: (position: string) => void;
    updateDate: (date: string) => void;
    updateContent: (content: string) => void;
    updateClosing: (closing: string) => void;
    updateSignature: (signature: string) => void;
    setTemplate: (templateId: number) => void;
    updateFormatting: (formatting: Partial<import('../types').FormattingOptions>) => void;
    resetFormatting: () => void;
    loadSampleData: () => void;
    autoPopulateFromResume: (basics: import('../types').Basics) => void;
    reset: () => void;
}

const getDefaultCoverLetterData = (): CoverLetterData => ({
    recipientName: '',
    recipientTitle: '',
    company: '',
    companyAddress: '',
    position: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    content: '',
    closing: 'Sincerely',
    signature: '',
    selectedTemplate: 21, // Default Professional LaTeX Cover Letter
    formatting: getDefaultFormatting(),
});

export const useCoverLetterStore = create<CoverLetterStore>()(
    persist(
        (set) => ({
            coverLetterData: getDefaultCoverLetterData(),
            showCoverLetter: false,

            setShowCoverLetter: (show: boolean) => set({ showCoverLetter: show }),

            updateRecipient: (recipient: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, ...recipient },
                })),

            updatePosition: (position: string) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, position },
                })),

            updateDate: (date: string) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, date },
                })),

            updateContent: (content: string) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, content },
                })),

            updateClosing: (closing: string) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, closing },
                })),

            updateSignature: (signature: string) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, signature },
                })),

            setTemplate: (templateId: number) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: { ...state.coverLetterData, selectedTemplate: templateId },
                })),

            updateFormatting: (formatting: Partial<import('../types').FormattingOptions>) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        formatting: { ...state.coverLetterData.formatting, ...formatting },
                    },
                })),

            resetFormatting: () =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        formatting: getDefaultFormatting(),
                    },
                })),

            loadSampleData: () => {
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        ...SAMPLE_COVER_LETTER_DATA,
                    }
                }));
            },

            autoPopulateFromResume: (basics: import('../types').Basics) =>
                set((state: CoverLetterStore) => ({
                    coverLetterData: {
                        ...state.coverLetterData,
                        signature: basics.name || state.coverLetterData.signature,
                        userBasics: basics,
                    }
                })),

            reset: () => set({ coverLetterData: getDefaultCoverLetterData() }),
        }),
        {
            name: 'resume-builder-cover-letter',
        }
    )
);
