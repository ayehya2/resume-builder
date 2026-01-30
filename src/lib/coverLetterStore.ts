import { create } from 'zustand';
import type { CoverLetterData, Basics } from '../types';

const getDefaultCoverLetterData = (): CoverLetterData => ({
    recipientName: '',
    recipientTitle: '',
    company: '',
    companyAddress: '',
    position: '',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    greeting: 'Dear Hiring Manager,',
    opening: '',
    body: [''],
    closing: 'Sincerely,',
    signature: '',
});

interface CoverLetterStore {
    coverLetterData: CoverLetterData;

    updateRecipient: (data: Partial<Pick<CoverLetterData, 'recipientName' | 'recipientTitle' | 'company' | 'companyAddress'>>) => void;
    updatePosition: (position: string) => void;
    updateDate: (date: string) => void;
    updateGreeting: (greeting: string) => void;
    updateOpening: (opening: string) => void;
    updateBody: (body: string[]) => void;
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

    updateGreeting: (greeting) =>
        set((state) => ({
            coverLetterData: { ...state.coverLetterData, greeting },
        })),

    updateOpening: (opening) =>
        set((state) => ({
            coverLetterData: { ...state.coverLetterData, opening },
        })),

    updateBody: (body) =>
        set((state) => ({
            coverLetterData: { ...state.coverLetterData, body },
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
