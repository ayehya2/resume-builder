import { useResumeStore } from '../../store'
import { useState } from 'react';

export function SkillsForm() {
    const { resumeData, addSkill, updateSkill, removeSkill } = useResumeStore();
    const { skills } = resumeData;
    const [newSkillInput, setNewSkillInput] = useState<{ [key: number]: string }>({});

    const addSkillItem = (index: number) => {
        const skill = skills[index];
        const newItem = newSkillInput[index]?.trim();

        if (newItem) {
            updateSkill(index, { items: [...skill.items, newItem] });
            setNewSkillInput({ ...newSkillInput, [index]: '' });
        }
    };

    const removeSkillItem = (skillIndex: number, itemIndex: number) => {
        const skill = skills[skillIndex];
        updateSkill(skillIndex, {
            items: skill.items.filter((_, i) => i !== itemIndex),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 border-2 border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Skills</h3>
                <button
                    onClick={addSkill}
                    className="px-3 py-1.5 btn-accent font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm rounded-sm"
                >
                    + Add Category
                </button>
            </div>

            {skills.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No skills added yet. Click "Add Skill Category" to get started.
                </p>
            )}

            <div className="space-y-4">
                {skills.map((skill, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Category #{index + 1}</h4>
                            <button
                                onClick={() => removeSkill(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase tracking-widest px-2 py-1 transition-all active:scale-90"
                            >
                                Remove
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Category Name</label>
                            <input
                                type="text"
                                value={skill.category}
                                onChange={(e) => updateSkill(index, { category: e.target.value })}
                                className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="Programming Languages"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skills</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {skill.items.map((item, itemIndex) => (
                                    <span
                                        key={itemIndex}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700"
                                    >
                                        {item}
                                        <button
                                            onClick={() => removeSkillItem(index, itemIndex)}
                                            className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            X
                                        </button>
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkillInput[index] || ''}
                                    onChange={(e) =>
                                        setNewSkillInput({ ...newSkillInput, [index]: e.target.value })
                                    }
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSkillItem(index);
                                        }
                                    }}
                                    className="flex-1 px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Type a skill..."
                                />
                                <button
                                    onClick={() => addSkillItem(index)}
                                    className="px-4 py-1.5 sm:py-2 bg-slate-700 text-white hover:bg-slate-600 font-bold text-xs uppercase transition-colors shadow-sm rounded-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
