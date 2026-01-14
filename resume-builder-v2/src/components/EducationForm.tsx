import { useResumeStore } from '../store';

export function EducationForm() {
    const { resumeData, addEducation, updateEducation, removeEducation } = useResumeStore();
    const { education } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Education</h3>
                <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                >
                    + Add Education
                </button>
            </div>

            {education.length === 0 && (
                <p className="text-slate-500 text-center py-8">
                    No education added yet. Click "Add Education" to get started.
                </p>
            )}

            {education.map((edu, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 font-bold hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Institution</label>
                            <input
                                type="text"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="University of Technology"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Location</label>
                            <input
                                type="text"
                                value={edu.location}
                                onChange={(e) => updateEducation(index, { location: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Boston, MA"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Degree</label>
                            <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Bachelor of Science"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Field of Study</label>
                            <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(index, { field: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Computer Science"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Graduation Date</label>
                            <input
                                type="text"
                                value={edu.graduationDate}
                                onChange={(e) => updateEducation(index, { graduationDate: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="May 2017"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">GPA (optional)</label>
                        <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(index, { gpa: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                            placeholder="3.8/4.0"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
