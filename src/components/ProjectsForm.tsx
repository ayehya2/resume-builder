import { useResumeStore } from '../store';
import { BulletList } from './BulletList';

export function ProjectsForm() {
    const { resumeData, addProject, updateProject, removeProject } = useResumeStore();
    const { projects } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Projects</h3>
                <button
                    onClick={addProject}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold"
                >
                    + Add Project
                </button>
            </div>

            {projects.length === 0 && (
                <p className="text-slate-700 font-semibold text-center py-8">
                    No projects added yet. Click "Add Project" to get started.
                </p>
            )}

            {projects.map((project, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        <button
                            onClick={() => removeProject(index)}
                            className="text-red-600 font-bold hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Project Name</label>
                            <input
                                type="text"
                                value={project.name}
                                onChange={(e) => updateProject(index, { name: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="E-commerce Platform"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">URL (optional)</label>
                            <input
                                type="url"
                                value={project.url || ''}
                                onChange={(e) => updateProject(index, { url: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-1">Project Details</label>
                        <BulletList
                            bullets={project.bullets}
                            onChange={(bullets) => updateProject(index, { bullets })}
                            placeholder="Built full-stack application"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Technologies</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {project.keywords.map((keyword, kidx) => (
                                <span
                                    key={kidx}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                >
                                    {keyword}
                                    <button
                                        onClick={() => {
                                            updateProject(index, {
                                                keywords: project.keywords.filter((_, i) => i !== kidx),
                                            });
                                        }}
                                        className="hover:text-indigo-900"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    e.preventDefault();
                                    updateProject(index, {
                                        keywords: [...project.keywords, e.currentTarget.value.trim()],
                                    });
                                    e.currentTarget.value = '';
                                }
                            }}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                            placeholder="Type technology and press Enter"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">Start Date (optional)</label>
                            <input
                                type="text"
                                value={project.startDate || ''}
                                onChange={(e) => updateProject(index, { startDate: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Jan 2023"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-black mb-1">End Date (optional)</label>
                            <input
                                type="text"
                                value={project.endDate || ''}
                                onChange={(e) => updateProject(index, { endDate: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                                placeholder="Present"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
