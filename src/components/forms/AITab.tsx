import { useState, useEffect } from 'react';
import { useAIStore } from '../../lib/aiStore';
import { useResumeStore } from '../../store';
import { useCoverLetterStore } from '../../lib/coverLetterStore';
import {
    generateResumeBullets,
    improveResumeBullet,
    generateCoverLetterOpening,
    generateCoverLetterBody,
    improveCoverLetterContent,
    generateProfessionalSummary,
} from '../../lib/geminiService';
import { Key, Sparkles, Loader, ExternalLink, Eye, EyeOff, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

interface AITabProps {
    documentType: 'resume' | 'coverletter';
}

export function AITab({ documentType }: AITabProps) {
    const { apiKey, isConfigured, setAPIKey, clearAPIKey, loadAPIKey } = useAIStore();
    const { resumeData } = useResumeStore();
    const { coverLetterData } = useCoverLetterStore();

    const [keyInput, setKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState('');
    const [error, setError] = useState('');

    // Form inputs for different AI generation types
    const [generationType, setGenerationType] = useState<'resume-bullet' | 'resume-summary' | 'cover-opening' | 'cover-body' | 'improve'>('resume-bullet');
    const [position, setPosition] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [contentToImprove, setContentToImprove] = useState('');

    useEffect(() => {
        loadAPIKey();
    }, [loadAPIKey]);

    const handleSaveKey = () => {
        if (keyInput.trim()) {
            setAPIKey(keyInput.trim());
            setKeyInput('');
            setShowKey(false);
        }
    };

    const handleClearKey = () => {
        if (confirm('Are you sure you want to remove your API key?')) {
            clearAPIKey();
            setKeyInput('');
        }
    };

    const handleGenerate = async () => {
        if (!isConfigured) {
            setError('Please configure your API key first');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuggestion('');

        try {
            if (documentType === 'resume') {
                if (generationType === 'resume-bullet') {
                    if (!position || !company || !description) {
                        setError('Please fill in position, company, and description');
                        return;
                    }
                    const bullets = await generateResumeBullets(apiKey, {
                        position,
                        company,
                        description,
                    });
                    setSuggestion(bullets.join('\n• '));
                } else if (generationType === 'resume-summary') {
                    const workExp = resumeData.work?.[0];
                    const summary = await generateProfessionalSummary(apiKey, {
                        name: resumeData.basics.name,
                        currentRole: workExp ? `${workExp.position} at ${workExp.company}` : undefined,
                        skills: resumeData.skills?.map(s => s.items.join(', ')).join('; '),
                        experience: resumeData.work?.map(w => `${w.position} at ${w.company}`).join(', '),
                        education: resumeData.education?.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join(', '),
                    });
                    setSuggestion(summary);
                } else if (generationType === 'improve' && contentToImprove) {
                    const improved = await improveResumeBullet(apiKey, contentToImprove);
                    setSuggestion(improved);
                }
            } else {
                // Cover letter
                if (generationType === 'cover-opening') {
                    if (!position || !company) {
                        setError('Please fill in position and company');
                        return;
                    }
                    const opening = await generateCoverLetterOpening(apiKey, {
                        position,
                        company,
                        userName: coverLetterData.signature || resumeData.basics.name,
                    });
                    setSuggestion(opening);
                } else if (generationType === 'cover-body') {
                    if (!position || !company) {
                        setError('Please fill in position and company');
                        return;
                    }
                    const paragraphs = await generateCoverLetterBody(apiKey, {
                        position,
                        company,
                        resumeData,
                        userNotes: description,
                    });
                    setSuggestion(paragraphs.join('\n\n'));
                } else if (generationType === 'improve' && contentToImprove) {
                    const improved = await improveCoverLetterContent(apiKey, contentToImprove);
                    setSuggestion(improved);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate content');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Assistant</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get AI-powered suggestions for your {documentType === 'resume' ? 'resume' : 'cover letter'} content using Google's Gemini API
                </p>
            </div>

            {/* API Key Configuration */}
            <div className="p-6 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 shadow-sm transition-all hover:border-slate-400 dark:hover:border-slate-500">
                <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-slate-100 dark:border-slate-800">
                    <Key size={18} className="text-slate-700 dark:text-slate-300" />
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">API Key Configuration</h4>
                    {isConfigured && (
                        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-950/30 px-2 py-0.5 border border-green-200 dark:border-green-900/50">
                            Active
                        </div>
                    )}
                </div>

                {isConfigured ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold italic">
                            <CheckCircle size={14} className="text-green-600 dark:text-green-500" />
                            <span>API key configured and ready for use</span>
                        </div>
                        <button
                            onClick={handleClearKey}
                            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold uppercase tracking-widest text-[10px] transition-colors"
                        >
                            Remove API Key
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                placeholder="Enter your Gemini API key"
                                className="flex-1 px-4 py-2 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 font-medium transition-all text-sm"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                title={showKey ? 'Hide key' : 'Show key'}
                            >
                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                            <button
                                onClick={handleSaveKey}
                                disabled={!keyInput.trim()}
                                className="px-6 py-2.5 btn-accent font-bold uppercase tracking-widest text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                            >
                                Save API Key
                            </button>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white uppercase tracking-tight transition-colors border-b border-dotted border-slate-400"
                            >
                                <ExternalLink size={12} />
                                Get a free API key from Google AI Studio
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {isConfigured && (
                <>
                    {/* Generation Type Selection */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider text-xs">
                                Help Objective
                            </label>
                            <select
                                value={generationType}
                                onChange={(e) => setGenerationType(e.target.value as 'resume-bullet' | 'resume-summary' | 'cover-opening' | 'cover-body' | 'improve')}
                                className="w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all appearance-none cursor-pointer"
                            >
                                {documentType === 'resume' ? (
                                    <>
                                        <option value="resume-bullet">Generate Resume Bullet Points</option>
                                        <option value="resume-summary">Generate Professional Summary</option>
                                        <option value="improve">Improve Existing Content</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="cover-opening">Generate Opening Paragraph</option>
                                        <option value="cover-body">Generate Body Paragraphs</option>
                                        <option value="improve">Improve Existing Content</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Input Fields Based on Generation Type */}
                        {generationType !== 'improve' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                                        Position/Role
                                    </label>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="e.g., Senior Software Engineer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="e.g., Tech Corp"
                                    />
                                </div>

                                {(generationType === 'resume-bullet' || generationType === 'cover-body') && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                                            {generationType === 'resume-bullet'
                                                ? 'Accountabilities & Achievements (Keywords)'
                                                : 'Key Highlights to Include'}
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all resize-none"
                                            placeholder="Specify deliverables, impact, or specific technologies..."
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {generationType === 'improve' && (
                            <div className="animate-in fade-in duration-300">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                                    Content to Optimize
                                </label>
                                <textarea
                                    value={contentToImprove}
                                    onChange={(e) => setContentToImprove(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all resize-none"
                                    placeholder="Paste the text you want to refine..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 btn-accent font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.99] border-t-2 border-slate-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                <span>Optimization in Progress...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} className="text-slate-400" />
                                <span>Process with AI</span>
                            </>
                        )}
                    </button>

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-slate-900 border-l-4 border-red-500 flex items-start gap-3">
                            <XCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-800 dark:text-red-300 font-bold uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {/* Suggestion Display */}
                    {suggestion && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 space-y-5 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-3">
                                <Sparkles size={18} className="text-slate-500" />
                                <h4 className="font-bold uppercase tracking-widest text-[10px]">AI Optimization Result</h4>
                            </div>
                            <div className="p-5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                                <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed tracking-tight">
                                    {suggestion}
                                </pre>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                                <span>Manual insertion required: Copy result into the appropriate section.</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <ShieldCheck size={16} className="text-slate-500 mt-0.5" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        Security Notice: Your API key is persisted locally within your browser's secure storage. Requests are dispatched directly to the Google AI Gateway. No data is stored on our auxiliary servers.
                    </p>
                </div>
            </div>
        </div>
    );
}
