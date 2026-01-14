import { useResumeStore } from '../store';

export function AwardsForm() {
    const { resumeData, addAward, updateAward, removeAward } = useResumeStore();
    const { awards } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Awards & Certifications</h3>
                <button
                    onClick={addAward}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                >
                    + Add Award
                </button>
            </div>

            {awards.length === 0 && (
                <p className="text-slate-700 font-semibold text-center py-8">
                    No awards added yet. Click "Add Award" to get started.
                </p>
            )}

            {awards.map((award, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">Award {index + 1}</h4>
                        <button
                            onClick={() => removeAward(index)}
                            className="text-red-600 font-bold hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Award Title</label>
                            <input
                                type="text"
                                value={award.title}
                                onChange={(e) => updateAward(index, { title: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Employee of the Month"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Awarded By</label>
                            <input
                                type="text"
                                value={award.awarder}
                                onChange={(e) => updateAward(index, { awarder: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Tech Solutions Inc."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">Date</label>
                        <input
                            type="text"
                            value={award.date}
                            onChange={(e) => updateAward(index, { date: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                            placeholder="May 2022"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">Summary (optional)</label>
                        <textarea
                            value={award.summary || ''}
                            onChange={(e) => updateAward(index, { summary: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                            rows={2}
                            placeholder="Brief description of the achievement..."
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
