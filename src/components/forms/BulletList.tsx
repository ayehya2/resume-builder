import { X } from 'lucide-react';

interface BulletListProps {
    bullets: string[];
    onChange: (bullets: string[]) => void;
    placeholder?: string;
    showAddButton?: boolean;
}

export function BulletList({ bullets, onChange, placeholder, showAddButton = true }: BulletListProps) {
    const addBullet = () => {
        onChange([...bullets, '']);
    };

    const updateBullet = (index: number, value: string) => {
        const newBullets = [...bullets];
        newBullets[index] = value;
        onChange(newBullets);
    };

    const removeBullet = (index: number) => {
        onChange(bullets.filter((_, i) => i !== index));
    };

    // Initialize with one bullet if empty
    if (bullets.length === 0) {
        onChange(['']);
        return null;
    }

    return (
        <div className="space-y-2">
            {bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-1.5 sm:gap-2 items-center">
                    <span className="text-xl leading-none text-slate-600 dark:text-slate-400">-</span>
                    <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        className={`
                            flex-1 px-2 py-1 sm:py-1.5 border-2
                            focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500
                            bg-white border-slate-300 text-slate-900
                            dark:bg-slate-950 dark:border-slate-600 dark:text-white
                            text-xs sm:text-sm
                        `}
                        placeholder={placeholder || 'Enter bullet point'}
                    />
                    {bullets.length > 1 && (
                        <button
                            onClick={() => removeBullet(idx)}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 bg-[#7f1d1d] text-white hover:bg-[#991b1b] font-black transition-colors flex items-center justify-center rounded-none"
                            type="button"
                            title="Remove point"
                        >
                            <X size={14} strokeWidth={3} className="sm:hidden" />
                            <X size={16} strokeWidth={3} className="hidden sm:block" />
                        </button>
                    )}
                </div>
            ))}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 pt-0.5">
                {showAddButton && (
                    <button
                        onClick={addBullet}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 btn-accent font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm rounded-sm"
                        type="button"
                    >
                        + Add Point
                    </button>
                )}
                <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 italic leading-tight ml-auto">
                    Tip: Use <strong>**bold**</strong> and <em>*italic*</em>
                </p>
            </div>
        </div>
    );
}
