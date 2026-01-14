import { useResumeStore } from '../store';
import { BulletList } from './BulletList';

export function WorkForm() {
    const { resumeData, addWork, updateWork, removeWork } = useResumeStore();
    const { work } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Work Experience</h3>
                <button
                    onClick={addWork}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                >
                    + Add Job
                </button>
            </div>

            {work.length === 0 && (
                <p className="text-slate-700 font-semibold text-center py-8">
                    No work experience added yet. Click "Add Job" to get started.
                </p>
            )}

            {work.map((job, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">Job {index + 1}</h4>
                        <button
                            onClick={() => removeWork(index)}
                            className="text-red-600 font-bold hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Company</label>
                            <input
                                type="text"
                                value={job.company}
                                onChange={(e) => updateWork(index, { company: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Tech Solutions Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Position</label>
                            <input
                                type="text"
                                value={job.position}
                                onChange={(e) => updateWork(index, { position: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Location</label>
                            <input
                                type="text"
                                value={job.location}
                                onChange={(e) => updateWork(index, { location: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="San Francisco, CA"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Start Date</label>
                            <input
                                type="text"
                                value={job.startDate}
                                onChange={(e) => updateWork(index, { startDate: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Jan 2020"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">End Date</label>
                            <input
                                type="text"
                                value={job.endDate}
                                onChange={(e) => updateWork(index, { endDate: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Present"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">Responsibilities & Achievements</label>
                        <BulletList
                            bullets={job.bullets}
                            onChange={(bullets) => updateWork(index, { bullets })}
                            placeholder="Led team of 5 developers"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
