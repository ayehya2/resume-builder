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
                <div key={idx} className="flex gap-2 items-start">
                    <span className="text-xl font-bold mt-1.5 dark:text-white">•</span>
                    <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium border-slate-400 text-black dark:border-gray-600 dark:bg-black dark:text-white"
                        placeholder={placeholder || 'Enter bullet point'}
                    />
                    {bullets.length > 1 && (
                        <button
                            onClick={() => removeBullet(idx)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors"
                            type="button"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
            <button
                onClick={addBullet}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold transition-colors"
                type="button"
            >
                + Add Bullet Point
            </button>
        </div>
    );
}
