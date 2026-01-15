import { useResumeStore } from '../../store'
import { BulletList } from './BulletList';

export function ProjectsForm() {
    const { resumeData, addProject, updateProject, removeProject } = useResumeStore();
    const { projects } = resumeData;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Projects</h3>
                <button
                    onClick={addProject}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold transition-colors shadow-sm"
                >
                    + Add Project
                </button>
            </div>

            {projects.length === 0 && (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    No projects added yet. Click "Add Project" to get started.
                </p>
            )}

            <div className="space-y-4">
                {projects.map((project, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Project {index + 1}</h4>
                            <button
                                onClick={() => removeProject(index)}
                                className="text-red-500 hover:text-red-600 font-bold text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={project.name}
                                    onChange={(e) => updateProject(index, { name: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="E-Commerce Platform"
                                />
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">URL Name</label>
                                    <input
                                        type="text"
                                        value={project.urlName}
                                        onChange={(e) => updateProject(index, { urlName: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="GitHub"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Project URL</label>
                                    <input
                                        type="url"
                                        value={project.url}
                                        onChange={(e) => updateProject(index, { url: e.target.value })}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="https://github.com/..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="text"
                                    value={project.startDate}
                                    onChange={(e) => updateProject(index, { startDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Jan 2023"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                <input
                                    type="text"
                                    value={project.endDate}
                                    onChange={(e) => updateProject(index, { endDate: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                    placeholder="Present"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Technologies (comma separated)</label>
                            <input
                                type="text"
                                value={project.keywords.join(', ')}
                                onChange={(e) => updateProject(index, { keywords: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                placeholder="React, Node.js, Stripe, AWS"
                            />
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description & Key Features</label>
                            <BulletList
                                bullets={project.bullets}
                                onChange={(bullets) => updateProject(index, { bullets })}
                                placeholder="Built full-stack e-commerce platform"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
