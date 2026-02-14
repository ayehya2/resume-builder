import { create } from 'zustand';
import type { CoverLetterData, Basics } from '../types';

const getDefaultCoverLetterData = (): CoverLetterData => ({
    recipientName: '',
    recipientTitle: '',
    company: '',
    companyAddress: '',
    position: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    content: 'Dear Hiring Manager,',
    closing: 'Sincerely,',
    signature: '',
});

interface CoverLetterStore {
    coverLetterData: CoverLetterData;

    updateRecipient: (data: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => void;
    updatePosition: (position: string) => void;
    updateDate: (date: string) => void;
    updateContent: (content: string) => void;
    updateClosing: (closing: string) => void;
    updateSignature: (signature: string) => void;

    autoPopulateFromResume: (basics: Basics) => void;
    reset: () => void;
}

export const useCoverLetterStore = create<CoverLetterStore>((set) => ({
    coverLetterData: getDefaultCoverLetterData(),

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

    autoPopulateFromResume: (basics) =>
        set((state) => ({
            coverLetterData: {
                ...state.coverLetterData,
                signature: basics.name,
                userBasics: basics,
            },
        })),

    reset: () => set({ coverLetterData: getDefaultCoverLetterData() }),
}));
