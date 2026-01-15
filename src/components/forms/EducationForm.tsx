import { useResumeStore } from '../../store'

export function EducationForm() {
    const { resumeData, addEducation, updateEducation, removeEducation } = useResumeStore();
    const { education } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Education</h3>
                <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold transition-colors shadow-sm"
                >
                    + Add Education
                </button>
            </div>

            {education.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    No education added yet. Click "Add Education" to get started.
                </p>
            )}

            <div className="space-y-4">
                {education.map((edu, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Education {index + 1}</h4>
                            <button
                                onClick={() => removeEducation(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="University of Technology"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => updateEducation(index, { location: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Boston, MA"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Bachelor of Science"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Field of Study</label>
                                <input
                                    type="text"
                                    value={edu.field}
                                    onChange={(e) => updateEducation(index, { field: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Computer Science"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Graduation Date</label>
                                <input
                                    type="text"
                                    value={edu.graduationDate}
                                    onChange={(e) => updateEducation(index, { graduationDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="May 2017"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">GPA (optional)</label>
                            <input
                                type="text"
                                value={edu.gpa || ''}
                                onChange={(e) => updateEducation(index, { gpa: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="3.8/4.0"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
