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
                    <span className="text-xl leading-none text-black dark:text-white">•</span>
                    <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        className={`
                            flex-1 px-2 py-1.5 border rounded
                            focus:outline-none focus:ring-2 focus:ring-violet-500
                            bg-white border-gray-300 text-black
                            dark:bg-black dark:border-gray-600 dark:text-white
                        `}
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
