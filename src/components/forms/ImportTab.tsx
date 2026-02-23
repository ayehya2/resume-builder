import React, { useState, useRef } from 'react';
import { useModal } from '../ThemedModal';
import { Upload, FolderOpen, Linkedin, Check, AlertTriangle, FileText, X } from 'lucide-react';
import { useResumeStore } from '../../store';
import { parseResumeFile } from '../../lib/resumeParser';
import { importFromJSON } from '../../lib/storage';
import type { ResumeData } from '../../types';

interface ParentDocument {
    id: string;
    title?: string;
    type?: string;
}

interface ImportTabProps {
    parentDocuments?: ParentDocument[];
    onLoadParentDoc?: (id: string | null) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({
    parentDocuments = [],
    onLoadParentDoc
}) => {
    const isIntegrated = typeof window !== 'undefined' && window.self !== window.top;
    const modal = useModal();

    const [isImporting, setIsImporting] = useState(false);
    const [liText, setLiText] = useState('');
    const [importSource, setImportSource] = useState<'file' | 'linkedin' | 'cloud'>(isIntegrated ? 'cloud' : 'file');
    const [liMethod, setLiMethod] = useState<'pdf' | 'text'>('pdf');

    // Pending import data for preview
    const [pendingData, setPendingData] = useState<Partial<ResumeData> | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const liPdfRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);

        try {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (ext === 'json') {
                const text = await file.text();
                const data = importFromJSON(text);
                setPendingData(data);
            } else {
                const parsed = await parseResumeFile(file);
                setPendingData(parsed);
            }
        } catch (err) {
            console.error('Import error:', err);
            modal.alert('Import Failed', 'Failed to parse file. Please ensure it is a valid resume document.');
        } finally {
            setIsImporting(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleLinkedInTextParse = () => {
        if (!liText.trim()) return;

        // Lightweight Regex Logic Parser for LinkedIn Text
        const lines = liText.split('\n').map(l => l.trim()).filter(Boolean);
        const parsed: Partial<ResumeData> = {
            basics: { name: '', email: '', phone: '', address: '', summary: '', websites: [] },
            work: [],
            education: [],
            skills: [],
        };

        // Very basic heuristic mapping
        // Headline often first line
        if (lines.length > 0) parsed.basics!.name = lines[0]; // Title/Headline

        // Look for sections
        let currentMode: 'summary' | 'experience' | 'education' | 'skills' | null = null;

        lines.forEach(line => {
            const lower = line.toLowerCase();
            if (lower.includes('about') || lower.includes('summary')) currentMode = 'summary';
            else if (lower.includes('experience')) currentMode = 'experience';
            else if (lower.includes('education')) currentMode = 'education';
            else if (lower.includes('skills')) currentMode = 'skills';
            else if (currentMode === 'summary') {
                parsed.basics!.summary += (parsed.basics!.summary ? ' ' : '') + line;
            } else if (currentMode === 'experience') {
                // Heuristic: line with date or bold-ish text starts new work entry
                if (line.match(/\d{4}/)) {
                    parsed.work!.push({ company: line, position: 'Role', location: '', startDate: '', endDate: '', bullets: [''] });
                } else if (parsed.work!.length > 0) {
                    const last = parsed.work![parsed.work!.length - 1];
                    if (last.bullets[0] === '') last.bullets[0] = line;
                    else last.bullets.push(line);
                }
            } else if (currentMode === 'education') {
                if (line.length > 5 && !line.includes('|')) {
                    parsed.education!.push({ institution: line, degree: '', field: '', location: '', graduationDate: '' });
                }
            } else if (currentMode === 'skills') {
                const items = line.split(/[,|•]/).map(s => s.trim()).filter(Boolean);
                if (items.length > 0) {
                    parsed.skills!.push({ category: 'Imported Skills', items });
                }
            }
        });

        setPendingData(parsed);
    };

    const applyImport = () => {
        if (!pendingData) return;

        // Merge logic: protect existing data if new is sparse
        const current = useResumeStore.getState().resumeData;
        const merged = {
            ...current,
            basics: { ...current.basics, ...pendingData.basics },
            work: pendingData.work?.length ? pendingData.work : current.work,
            education: pendingData.education?.length ? pendingData.education : current.education,
            skills: pendingData.skills?.length ? pendingData.skills : current.skills,
        };

        useResumeStore.setState({ resumeData: merged });
        setPendingData(null);
        setLiText('');
        modal.alert('Import Successful', 'Resume imported successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Import Navigation */}
            <div className="flex bg-white/5 border-2 border-white/20 p-1 mb-8 shadow-inner">
                <button
                    onClick={() => setImportSource('file')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 whitespace-nowrap ${importSource === 'file' ? 'bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)] ring-1 ring-white/30' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                >
                    Local File
                </button>
                {isIntegrated && (
                    <button
                        onClick={() => setImportSource('cloud')}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 whitespace-nowrap ${importSource === 'cloud' ? 'bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)] ring-1 ring-white/30' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                    >
                        JobMint Cloud
                    </button>
                )}
                <button
                    onClick={() => setImportSource('linkedin')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 whitespace-nowrap ${importSource === 'linkedin' ? 'bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)] ring-1 ring-white/30' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
                >
                    LinkedIn
                </button>
            </div>

            <div className="min-h-[300px]">
                {importSource === 'file' && (
                    <div className="space-y-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group h-64 border-2 border-dashed border-white/10 hover:border-accent/50 bg-white/5 hover:bg-accent/5 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Upload size={40} className="mb-4 text-white/20 group-hover:text-accent transition-colors" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white mb-2">
                                {isImporting ? 'Parsing...' : 'Drag or Click to Upload'}
                            </h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Supports JSON, PDF, DOCX</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json,.pdf,.docx"
                                onChange={(e) => handleFileChange(e)}
                            />
                        </div>
                        <div className="p-4 bg-blue-500/10 border-2 border-blue-500/20 flex gap-4">
                            <AlertTriangle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-blue-300 leading-relaxed uppercase tracking-wider">
                                Imported data will intelligently merge with your current profile. You can review all changes before finalizing.
                            </p>
                        </div>
                    </div>
                )}

                {importSource === 'cloud' && isIntegrated && (
                    <div className="space-y-4">
                        {parentDocuments.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-white/10 bg-white/5 italic text-[10px] uppercase font-black tracking-widest opacity-30">
                                No Cloud Documents Found
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {parentDocuments.filter(d => d.type !== 'coverletter').map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => onLoadParentDoc?.(doc.id)}
                                        className="flex items-center gap-4 p-5 text-left border-2 border-white/10 hover:border-accent hover:bg-white/5 transition-all group"
                                    >
                                        <div className="w-12 h-14 bg-white/5 border-2 border-white/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all">
                                            <FileText size={20} className="text-white/20 group-hover:text-accent" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black uppercase tracking-tight text-white/90 group-hover:text-white">{doc.title || 'Untitled Resume'}</div>
                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mt-1.5 flex items-center gap-2">
                                                <FolderOpen size={10} />
                                                JobMint Cloud
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {importSource === 'linkedin' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setLiMethod('pdf')}
                                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 whitespace-nowrap ${liMethod === 'pdf' ? 'border-accent bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)]' : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white'}`}
                            >
                                LinkedIn PDF
                            </button>
                            <button
                                onClick={() => setLiMethod('text')}
                                className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 whitespace-nowrap ${liMethod === 'text' ? 'border-accent bg-accent text-white shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)]' : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white'}`}
                            >
                                Paste Profile
                            </button>
                        </div>

                        {liMethod === 'pdf' ? (
                            <div
                                onClick={() => liPdfRef.current?.click()}
                                className="group h-64 border-2 border-dashed border-white/10 hover:border-accent/50 bg-white/5 hover:bg-accent/5 transition-all flex flex-col items-center justify-center cursor-pointer"
                            >
                                <Linkedin size={40} className="mb-4 text-[#0077b5] opacity-50 group-hover:opacity-100 transition-all" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white mb-2">Upload "Save to PDF" Export</h3>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center max-w-[200px]">
                                    Go to your LinkedIn profile → More → Save to PDF
                                </p>
                                <input
                                    type="file"
                                    ref={liPdfRef}
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={liText}
                                    onChange={(e) => setLiText(e.target.value)}
                                    placeholder="Paste your raw LinkedIn profile text here (Experience, Education, Skills sections)..."
                                    className="w-full h-64 bg-white/5 border-2 border-white/10 p-4 text-xs font-bold outline-none focus:border-accent transition-all resize-none custom-scrollbar text-white"
                                />
                                <button
                                    onClick={handleLinkedInTextParse}
                                    disabled={!liText.trim()}
                                    className="w-full py-4 bg-accent text-white font-black uppercase tracking-[0.2em] text-[10px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl"
                                >
                                    PARSE PROFILE DATA
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Dialog (Overlay) */}
            {pendingData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0f172a] border-2 border-accent w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(var(--accent-rgb),0.3)]">
                        <div className="p-6 border-b-2 border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-none shadow-lg">
                                    <Check size={18} className="text-white" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tighter text-white">Preview Changes</h3>
                            </div>
                            <button
                                onClick={() => setPendingData(null)}
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {pendingData.basics?.name && (
                                <section className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Personal Details</h4>
                                    <div className="p-4 bg-white/5 border border-white/10 font-bold text-xs text-white/80">
                                        {pendingData.basics.name} • {pendingData.basics.email || 'No Email Found'}
                                    </div>
                                </section>
                            )}

                            {pendingData.work && pendingData.work.length > 0 && (
                                <section className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Experience ({pendingData.work.length})</h4>
                                    <div className="space-y-2">
                                        {pendingData.work.slice(0, 3).map((w, i) => (
                                            <div key={i} className="p-3 bg-white/5 border border-white/10 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-white uppercase">{w.company}</span>
                                                <span className="text-[9px] opacity-40 uppercase font-black">{w.position}</span>
                                            </div>
                                        ))}
                                        {pendingData.work.length > 3 && <div className="text-[8px] opacity-30 uppercase font-black">+ {pendingData.work.length - 3} more entries</div>}
                                    </div>
                                </section>
                            )}

                            {pendingData.skills && pendingData.skills.length > 0 && (
                                <section className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">Skills Identified</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {pendingData.skills.flatMap(s => s.items).slice(0, 15).map((s, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white/60 tracking-wider hover:bg-accent/20 hover:text-accent transition-all cursor-default">{s}</span>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="p-6 border-t-2 border-white/10 flex flex-col sm:flex-row gap-4 bg-black/40">
                            <button
                                onClick={() => setPendingData(null)}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest border-2 border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Discard Changes
                            </button>
                            <button
                                onClick={applyImport}
                                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-accent text-white hover:brightness-110 shadow-[0_10px_30px_-5px_rgba(var(--accent-rgb),0.5)] active:scale-95 transition-all"
                            >
                                Confirm & Merge Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
