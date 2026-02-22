import { useResumeStore } from '../../store'
import { BulletList } from './BulletList';

export function WorkForm() {
    const { resumeData, addWork, updateWork, removeWork } = useResumeStore();
    const { work } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 border-2 border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Experience</h3>
                <button
                    onClick={addWork}
                    className="px-3 py-1.5 btn-accent font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm rounded-none"
                >
                    + Add Job
                </button>
            </div>

            {work.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-700">
                    No work experience added yet. Click "Add Job" to get started.
                </p>
            )}

            <div className="space-y-4">
                {work.map((job, index) => (
                    <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3 sm:p-5 space-y-3 sm:space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">Job #{index + 1}</h4>
                            <button
                                onClick={() => removeWork(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase tracking-widest px-2 py-1 transition-all active:scale-90"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Company</label>
                                <input
                                    type="text"
                                    value={job.company}
                                    onChange={(e) => updateWork(index, { company: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Tech Solutions Inc."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Position</label>
                                <input
                                    type="text"
                                    value={job.position}
                                    onChange={(e) => updateWork(index, { position: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Software Engineer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={job.location}
                                    onChange={(e) => updateWork(index, { location: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="San Francisco, CA"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Start Date</label>
                                <input
                                    type="text"
                                    value={job.startDate}
                                    onChange={(e) => updateWork(index, { startDate: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Jan 2020"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">End Date</label>
                                <input
                                    type="text"
                                    value={job.endDate}
                                    onChange={(e) => updateWork(index, { endDate: e.target.value })}
                                    className="w-full px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Present"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Responsibilities & Achievements</label>
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
