import { useResumeStore } from '../../store'

export function BasicsForm() {
    const { resumeData, updateBasics } = useResumeStore();
    const { basics } = resumeData;

    const addWebsite = () => {
        const newWebsites = [...basics.websites, { name: '', url: '' }];
        updateBasics({ websites: newWebsites });
    };

    const updateWebsite = (index: number, field: 'name' | 'url', value: string) => {
        const newWebsites = [...basics.websites];
        newWebsites[index] = { ...newWebsites[index], [field]: value };
        updateBasics({ websites: newWebsites });
    };

    const removeWebsite = (index: number) => {
        const newWebsites = basics.websites.filter((_, i) => i !== index);
        updateBasics({ websites: newWebsites });
    };

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your personal details and contact information.
                </p>
            </header>

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={basics.name}
                            onChange={(e) => updateBasics({ name: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={basics.email}
                            onChange={(e) => updateBasics({ email: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input
                            type="tel"
                            value={basics.phone}
                            onChange={(e) => updateBasics({ phone: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="(555) 000-0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                        <input
                            type="text"
                            value={basics.address}
                            onChange={(e) => updateBasics({ address: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                            placeholder="City, State"
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Websites & Links</h4>
                        <button
                            onClick={addWebsite}
                            className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                            + Add Website
                        </button>
                    </div>

                    <div className="space-y-3">
                        {basics.websites.map((site, index) => (
                            <div key={index} className="flex gap-3 items-end group">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Site Name</label>
                                    <input
                                        type="text"
                                        value={site.name}
                                        onChange={(e) => updateWebsite(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="LinkedIn"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">URL</label>
                                    <input
                                        type="url"
                                        value={site.url}
                                        onChange={(e) => updateWebsite(index, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                                <button
                                    onClick={() => removeWebsite(index)}
                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                    title="Remove Link"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        {basics.websites.length === 0 && (
                            <p className="text-xs text-slate-500 dark:text-slate-600 italic">No websites added. Add links to your LinkedIn, Portfolios, or Personal Sites.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
