
interface BulletListProps {
    bullets: string[];
    onChange: (bullets: string[]) => void;
    placeholder?: string;
}

export function BulletList({ bullets, onChange, placeholder }: BulletListProps) {
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
                <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xl leading-none text-slate-600 dark:text-slate-400">-</span>
                    <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        className={`
                            flex-1 px-2 py-1.5 border-2
                            focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500
                            bg-white border-slate-300 text-slate-900
                            dark:bg-slate-950 dark:border-slate-600 dark:text-white
                        `}
                        placeholder={placeholder || 'Enter bullet point'}
                    />
                    {bullets.length > 1 && (
                        <button
                            onClick={() => removeBullet(idx)}
                            className="px-3 py-2 bg-red-700 text-white hover:bg-red-600 font-semibold transition-colors"
                            type="button"
                        >
                            X
                        </button>
                    )}
                </div>
            ))}
            <button
                onClick={addBullet}
                className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 font-semibold transition-colors"
                type="button"
            >
                + Add Bullet Point
            </button>
        </div>
    );
}
