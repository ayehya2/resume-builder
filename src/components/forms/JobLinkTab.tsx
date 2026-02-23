import React, { useState } from 'react';
import { Search, Check, Zap, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useJobStore } from '../../lib/jobStore';

interface ParentApplication {
    id: string;
    company: string;
    position: string;
}

interface JobLinkTabProps {
    parentApplications?: ParentApplication[];
    onLinkJob?: (id: string) => void;
}

export const JobLinkTab: React.FC<JobLinkTabProps> = ({
    parentApplications = [],
    onLinkJob
}) => {
    const isIntegrated = typeof window !== 'undefined' && window.self !== window.top;
    const {
        jobTitle, jobUrl, jobDescription, linkedJobId, applyToBoth, setJobContext
    } = useJobStore();

    const [view, setView] = useState<'tracker' | 'manual'>(isIntegrated ? 'tracker' : 'manual');
    const [search, setSearch] = useState('');

    const filteredApps = parentApplications.filter(app =>
        !search ||
        app.company.toLowerCase().includes(search.toLowerCase()) ||
        app.position.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header section with toggle and global settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white/10 pb-6 mb-6">
                <div className="flex bg-white/5 p-1 border-2 border-white/20 shadow-inner">
                    {isIntegrated && (
                        <button
                            onClick={() => setView('tracker')}
                            className={`flex-1 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 whitespace-nowrap ${view === 'tracker' ? 'bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)] ring-1 ring-white/30' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                        >
                            JobTracker
                        </button>
                    )}
                    <button
                        onClick={() => setView('manual')}
                        className={`flex-1 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 whitespace-nowrap ${view === 'manual' ? 'bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)] ring-1 ring-white/30' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                    >
                        Manual Input
                    </button>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group bg-white/5 px-4 py-2 border-2 border-white/10 hover:border-white/20 transition-all">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={applyToBoth}
                            onChange={(e) => setJobContext({ applyToBoth: e.target.checked })}
                            className="sr-only"
                        />
                        <div className={`w-11 h-6 transition-all duration-300 ${applyToBoth ? 'bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white shadow-sm transition-all duration-300 ${applyToBoth ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/50 group-hover:text-white transition-colors">
                        Auto-Sync Resume & Letter
                    </span>
                </label>
            </div>

            {view === 'tracker' && isIntegrated ? (
                <div className="space-y-4">
                    <div className="relative border-2 border-white/10 bg-black/20">
                        <div className="px-4 py-3.5 border-b-2 border-white/10 flex items-center gap-3">
                            <Search size={14} className="opacity-20" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="SEARCH YOUR APPLICATIONS..."
                                className="bg-transparent text-[10px] outline-none w-full font-black tracking-widest uppercase placeholder:opacity-20 text-white"
                            />
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {filteredApps.length === 0 ? (
                                <div className="p-12 text-center text-[10px] opacity-30 uppercase font-bold tracking-widest italic">
                                    No Applications Found
                                </div>
                            ) : (
                                filteredApps.map((app) => {
                                    const isSelected = linkedJobId === app.id;
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => {
                                                setJobContext({ linkedJobId: app.id, jobTitle: app.position });
                                                if (onLinkJob) onLinkJob(app.id);
                                            }}
                                            className={`w-full text-left px-5 py-5 transition-all border-b last:border-0 border-white/5 group flex items-center justify-between ${isSelected ? 'bg-accent/10' : 'hover:bg-white/5'}`}
                                        >
                                            <div>
                                                <div className={`font-bold text-xs uppercase tracking-tight ${isSelected ? 'text-accent' : 'text-white/80 group-hover:text-white'}`}>{app.position}</div>
                                                <div className="text-[9px] opacity-40 font-black uppercase tracking-widest mt-1.5">{app.company}</div>
                                            </div>
                                            {isSelected && <Check size={16} className="text-accent" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] flex items-center gap-2">
                        <AlertCircle size={12} />
                        Linking a job automatically updates your cover letter recipient.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Job Title</label>
                            <div className="relative group">
                                <Zap size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="text"
                                    value={jobTitle}
                                    onChange={e => setJobContext({ jobTitle: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                    className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 text-xs font-bold outline-none focus:border-accent group-focus-within:pl-10 transition-all placeholder:text-white/20 text-white focus:bg-white/[0.07]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Job URL (Optional)</label>
                            <div className="relative group">
                                <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <input
                                    type="text"
                                    value={jobUrl}
                                    onChange={e => setJobContext({ jobUrl: e.target.value })}
                                    placeholder="https://linkedin.com/jobs/..."
                                    className="w-full px-4 py-4 bg-white/5 border-2 border-white/10 text-xs font-bold outline-none focus:border-accent group-focus-within:pl-10 transition-all placeholder:text-white/20 text-white focus:bg-white/[0.07]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-white/40">Job Description</label>
                        <textarea
                            value={jobDescription}
                            onChange={e => setJobContext({ jobDescription: e.target.value })}
                            placeholder="Paste the job description here. AI will use this as the primary source of truth for tailoring."
                            className="w-full h-64 px-4 py-4 bg-white/5 border-2 border-white/10 text-xs font-bold outline-none focus:border-accent transition-all resize-none custom-scrollbar placeholder:text-white/20 text-white focus:bg-white/[0.07]"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                                {jobDescription.length} characters entered
                            </span>
                            <button
                                onClick={() => setJobContext({ jobTitle: '', jobUrl: '', jobDescription: '', linkedJobId: null })}
                                className="text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
