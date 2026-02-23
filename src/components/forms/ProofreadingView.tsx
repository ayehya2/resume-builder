import { useProofreadingStore } from '../../lib/proofreadingStore';
import { AlertCircle, CheckCircle2, Info, X, Zap } from 'lucide-react';

export function ProofreadingView() {
    const { suggestions, isOpen, setIsOpen, isChecking } = useProofreadingStore();

    if (suggestions.length === 0 && !isChecking) return null;

    return (
        <div className="relative mt-2">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-white/5 border-2 border-dashed border-white/10 hover:border-accent/40 hover:bg-white/10 transition-all group"
                    title="View Writing Suggestions"
                >
                    <div className="flex items-center gap-2">
                        <Zap size={14} className={isChecking ? 'animate-pulse text-yellow-500' : 'text-white/40'} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/70">Writing Assistant</span>
                    </div>
                    {suggestions.length > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 min-w-[18px] text-center rounded-none ring-1 ring-white/20">
                            {suggestions.length}
                        </span>
                    )}
                </button>
            ) : (
                <div className="absolute left-0 bottom-full w-full bg-[#0f111a] border-2 border-white/10 shadow-2xl flex flex-col max-h-[400px] animate-in slide-in-from-bottom-2 duration-200 z-[110]">
                    {/* Header */}
                    <div className="p-3 border-b-2 border-white/10 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-yellow-500" />
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/80">Writing Assistant</h4>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Suggestions List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-black/40">
                        {isChecking && suggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-white/20 gap-2 text-center px-4">
                                <Zap size={20} className="animate-pulse text-yellow-500/50" />
                                <span className="text-[8px] font-bold uppercase tracking-widest leading-normal">Analyzing your text for style & grammar...</span>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 text-green-500/50 gap-2">
                                <CheckCircle2 size={20} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">No issues found!</span>
                            </div>
                        ) : (
                            suggestions.map((s: any) => (
                                <div key={s.id} className={`p-3 border-l-4 ${s.type === 'style' ? 'border-blue-500/40 bg-blue-500/5' : 'border-orange-500/40 bg-orange-500/5'} space-y-2 group/item relative`}>
                                    <div className="flex items-start gap-2">
                                        {s.type === 'style' ? <Info size={12} className="text-blue-400 mt-0.5" /> : <AlertCircle size={12} className="text-orange-400 mt-0.5" />}
                                        <div className="space-y-1 flex-1">
                                            <p className="text-[10px] font-bold text-white/90 leading-tight italic">
                                                &quot;{s.text}&quot;
                                            </p>
                                            <p className="text-[9px] text-white/50 leading-snug">
                                                {s.message}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const { dismissSuggestion } = useProofreadingStore.getState();
                                                dismissSuggestion(s.id);
                                            }}
                                            className="opacity-0 group-hover/item:opacity-100 text-white/20 hover:text-white/60 transition-all p-0.5"
                                            title="Dismiss"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1 border-t border-white/5 mt-1">
                                        <button
                                            onClick={() => {
                                                const { ignoreWord } = useProofreadingStore.getState();
                                                ignoreWord(s.text);
                                            }}
                                            className="text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors"
                                        >
                                            [ Ignore Always ]
                                        </button>

                                        {s.suggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 flex-1 justify-end">
                                                {s.suggestions.map((suggestion: string, idx: number) => (
                                                    <span key={idx} className="bg-white/5 text-white/80 text-[8px] px-2 py-0.5 font-bold border border-white/10 uppercase tracking-tighter">
                                                        {suggestion}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-white/5 bg-black/60 text-center">
                        <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                            Style: write-good • Grammar: LT
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
