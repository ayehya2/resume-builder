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
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skills</h3>
                <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold transition-colors shadow-sm"
                >
                    + Add Skill Category
                </button>
            </div>

            {skills.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    No skills added yet. Click "Add Skill Category" to get started.
                </p>
            )}

            <div className="space-y-4">
                {skills.map((skill, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Skill Category {index + 1}</h4>
                            <button
                                onClick={() => removeSkill(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                            <input
                                type="text"
                                value={skill.category}
                                onChange={(e) => updateSkill(index, { category: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="Programming Languages"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Skills</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {skill.items.map((item, itemIndex) => (
                                    <span
                                        key={itemIndex}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-800/50"
                                    >
                                        {item}
                                        <button
                                            onClick={() => removeSkillItem(index, itemIndex)}
                                            className="hover:text-violet-900 dark:hover:text-white transition-colors"
                                        >
                                            ✕
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
                                    className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Type a skill and press Enter"
                                />
                                <button
                                    onClick={() => addSkillItem(index)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors shadow-sm"
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
