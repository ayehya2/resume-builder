import { useResumeStore } from '../../store'
import { BulletList } from './BulletList';

export function WorkForm() {
    const { resumeData, addWork, updateWork, removeWork } = useResumeStore();
    const { work } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Work Experience</h3>
                <button
                    onClick={addWork}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold transition-colors shadow-sm"
                >
                    + Add Job
                </button>
            </div>

            {work.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    No work experience added yet. Click "Add Job" to get started.
                </p>
            )}

            <div className="space-y-4">
                {work.map((job, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Job {index + 1}</h4>
                            <button
                                onClick={() => removeWork(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={job.company}
                                    onChange={(e) => updateWork(index, { company: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Tech Solutions Inc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                                <input
                                    type="text"
                                    value={job.position}
                                    onChange={(e) => updateWork(index, { position: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Software Engineer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={job.location}
                                    onChange={(e) => updateWork(index, { location: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="San Francisco, CA"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="text"
                                    value={job.startDate}
                                    onChange={(e) => updateWork(index, { startDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Jan 2020"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                <input
                                    type="text"
                                    value={job.endDate}
                                    onChange={(e) => updateWork(index, { endDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Present"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Responsibilities & Achievements</label>
                            <BulletList
                                bullets={job.bullets}
                                onChange={(bullets) => updateWork(index, { bullets })}
                                placeholder="Led team of 5 developers"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
