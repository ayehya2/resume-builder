import { useResumeStore } from '../store';
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
                <h3 className="text-lg font-bold text-black">Skills</h3>
                <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                >
                    + Add Skill Category
                </button>
            </div>

            {skills.length === 0 && (
                <p className="text-slate-700 font-semibold text-center py-8">
                    No skills added yet. Click "Add Skill Category" to get started.
                </p>
            )}

            {skills.map((skill, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">Skill Category {index + 1}</h4>
                        <button
                            onClick={() => removeSkill(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">Category Name</label>
                        <input
                            type="text"
                            value={skill.category}
                            onChange={(e) => updateSkill(index, { category: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                            placeholder="Programming Languages"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {skill.items.map((item, itemIndex) => (
                                <span
                                    key={itemIndex}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                                >
                                    {item}
                                    <button
                                        onClick={() => removeSkillItem(index, itemIndex)}
                                        className="hover:text-violet-900"
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
                                className="flex-1 px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Type a skill and press Enter"
                            />
                            <button
                                onClick={() => addSkillItem(index)}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
