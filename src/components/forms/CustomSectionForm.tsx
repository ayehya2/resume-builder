import { useResumeStore } from '../../store';
import { BulletList } from './BulletList';
import { Plus, ExternalLink } from 'lucide-react';
import type { CustomSection, CustomSectionEntry } from '../../types';

interface CustomSectionFormProps {
    sectionId?: string;
}

export function CustomSectionForm({ sectionId }: CustomSectionFormProps) {
    const {
        resumeData,
        updateCustomSection,
        removeCustomSection,
        addCustomSectionItem,
        updateCustomSectionItem,
        removeCustomSectionItem
    } = useResumeStore();

    // Find the sections to render
    const sectionsToRender = sectionId
        ? resumeData.customSections.filter((s: CustomSection) => s.id === sectionId)
        : resumeData.customSections;

    if (sectionsToRender.length === 0 && sectionId) {
        return <div className="p-8 text-center text-slate-500 italic">Section not found</div>;
    }

    const handleTitleChange = (id: string, title: string) => {
        updateCustomSection(id, { title });
    };

    const handleTypeChange = (id: string, type: 'bullets' | 'text') => {
        updateCustomSection(id, { type });
    };

    const handleRemoveSection = (id: string) => {
        if (confirm('Are you sure you want to remove this entire custom section?')) {
            removeCustomSection(id);
        }
    };

    return (
        <div className="space-y-6">
            {sectionsToRender.map((section: CustomSection) => (
                <div key={section.id} className="space-y-6">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 flex-1">
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleTitleChange(section.id, e.target.value)}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-xl transition-all h-[46px]"
                                placeholder="Section Title (e.g., Certifications)"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 p-1 h-[46px]">
                                <button
                                    onClick={() => handleTypeChange(section.id, 'bullets')}
                                    className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${section.type === 'bullets' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                >
                                    Bullets
                                </button>
                                <button
                                    onClick={() => handleTypeChange(section.id, 'text')}
                                    className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${section.type === 'text' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                >
                                    Paragraph
                                </button>
                            </div>
                            <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-2 border-transparent hover:border-red-100 dark:hover:border-red-900/40 h-[46px]"
                                title="Delete Entire Section"
                            >
                                Remove Section
                            </button>
                        </div>
                    </div>

                    {/* Entries Container */}
                    <div className="space-y-4">
                        {section.items.map((item: CustomSectionEntry, index: number) => (
                            <div key={index} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 relative group">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-sm">Entry {index + 1}</h4>
                                    <button
                                        onClick={() => removeCustomSectionItem(section.id, index)}
                                        className="text-red-600 hover:text-red-700 font-semibold text-sm px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title="Remove Entry"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Heading</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { title: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="e.g., Google Cloud Architect certificate"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub-heading</label>
                                        <input
                                            type="text"
                                            value={item.subtitle}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { subtitle: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="e.g., Google Training"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                                        <input
                                            type="text"
                                            value={item.date}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { date: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="Jan 2024 - Present"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={item.location}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { location: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="Remote / Sydney, AU"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Link</label>
                                            {item.link && (
                                                <a
                                                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs font-bold"
                                                >
                                                    <ExternalLink size={12} />
                                                    Visit
                                                </a>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={item.link}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { link: e.target.value })}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="https://verify.link/..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-bold uppercase tracking-wider text-xs px-1">Content Details</label>
                                    {section.type === 'bullets' ? (
                                        <BulletList
                                            bullets={item.bullets}
                                            onChange={(bullets) => updateCustomSectionItem(section.id, index, { bullets })}
                                        />
                                    ) : (
                                        <textarea
                                            value={item.bullets[0] || ''}
                                            onChange={(e) => updateCustomSectionItem(section.id, index, { bullets: [e.target.value] })}
                                            rows={3}
                                            className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all"
                                            placeholder="Describe your achievements or responsibilities..."
                                        />
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => addCustomSectionItem(section.id)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 text-slate-500 dark:text-slate-400 font-semibold transition-all bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            <span>Add New Entry to {section.title}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
