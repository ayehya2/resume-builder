import { useCoverLetterStore } from '../../lib/coverLetterStore';
import { useResumeStore } from '../../store';
import { Download, Sparkles } from 'lucide-react';
import { BulletList } from './BulletList';

export function CoverLetterForm() {
    const { coverLetterData, updateRecipient, updatePosition, updateDate, updateContent, updateClosing, updateSignature, autoPopulateFromResume } = useCoverLetterStore();
    const { resumeData } = useResumeStore();

    const handleImportFromResume = () => {
        autoPopulateFromResume(resumeData.basics);
        alert('Contact information imported from resume!');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cover Letter</h3>
                <button
                    onClick={handleImportFromResume}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 font-semibold transition-colors shadow-sm"
                    title="Import your name and contact info from resume"
                >
                    <Download size={16} />
                    <span>Import from Resume</span>
                </button>
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Date
                </label>
                <input
                    type="text"
                    value={coverLetterData.date}
                    onChange={(e) => updateDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="January 29, 2026"
                />
            </div>

            {/* Recipient Information */}
            <div className="space-y-4 p-5 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-tight text-sm pb-2 border-b border-slate-200 dark:border-slate-800">Recipient Information</h4>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Recipient Name
                    </label>
                    <input
                        type="text"
                        value={coverLetterData.recipientName}
                        onChange={(e) => updateRecipient({ recipientName: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="Jane Smith"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Recipient Title
                    </label>
                    <input
                        type="text"
                        value={coverLetterData.recipientTitle}
                        onChange={(e) => updateRecipient({ recipientTitle: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="Hiring Manager"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Company Name
                    </label>
                    <input
                        type="text"
                        value={coverLetterData.company}
                        onChange={(e) => updateRecipient({ company: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="Acme Corporation"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Company Address
                    </label>
                    <input
                        type="text"
                        value={coverLetterData.companyAddress}
                        onChange={(e) => updateRecipient({ companyAddress: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="123 Business St, City, State 12345"
                    />
                </div>
            </div>

            {/* Position */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Position Applying For
                </label>
                <input
                    type="text"
                    value={coverLetterData.position}
                    onChange={(e) => updatePosition(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="Senior Software Engineer"
                />
            </div>

            {/* Letter Body (Content) */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Letter Body (Greeting & Paragraphs)
                </label>
                <textarea
                    value={coverLetterData.content}
                    onChange={(e) => updateContent(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all resize-vertical"
                    placeholder={`Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company].\n\n[Body Paragraph 1]\n\n[Body Paragraph 2]`}
                />
            </div>

            {/* Closing */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Closing
                </label>
                <input
                    type="text"
                    value={coverLetterData.closing}
                    onChange={(e) => updateClosing(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="Sincerely,"
                />
            </div>

            {/* Signature */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name (Signature)
                </label>
                <input
                    type="text"
                    value={coverLetterData.signature}
                    onChange={(e) => updateSignature(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                    placeholder="Your Full Name"
                />
            </div>

            {coverLetterData.userBasics && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-white font-bold text-[10px]">CV</div>
                        <p className="text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest leading-none">
                            Contact profile synchronized: {coverLetterData.userBasics.name}
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-start gap-3">
                    <Sparkles size={16} className="text-slate-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        Professional Guidance: Utilize the "AI Assistant" module to generate highly targeted, industry-specific content for your cover letter.
                    </p>
                </div>
            </div>
        </div>
    );
}
