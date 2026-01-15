import { useResumeStore } from '../../store'

export function AwardsForm() {
    const { resumeData, addAward, updateAward, removeAward } = useResumeStore();
    const { awards } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Awards & Honors</h3>
                <button
                    onClick={addAward}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors shadow-sm"
                >
                    + Add Award
                </button>
            </div>

            {awards.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    No awards added yet. Click "Add Award" to get started.
                </p>
            )}

            <div className="space-y-4">
                {awards.map((award, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Award {index + 1}</h4>
                            <button
                                onClick={() => removeAward(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Award Title</label>
                                <input
                                    type="text"
                                    value={award.title}
                                    onChange={(e) => updateAward(index, { title: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Employee of the Year"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                <input
                                    type="text"
                                    value={award.date}
                                    onChange={(e) => updateAward(index, { date: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Dec 2022"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Issuer / Awarder</label>
                            <input
                                type="text"
                                value={award.awarder}
                                onChange={(e) => updateAward(index, { awarder: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="TechVision Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Summary (optional)</label>
                            <textarea
                                value={award.summary || ''}
                                onChange={(e) => updateAward(index, { summary: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="Recognized for outstanding leadership and mentorship..."
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
