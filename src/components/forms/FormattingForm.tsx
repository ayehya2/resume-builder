import { useResumeStore } from '../../store'
import type { ColorTheme, SectionDivider, Alignment } from '../../types';

export function FormattingForm() {
    const { resumeData, updateFormatting, resetFormatting } = useResumeStore();
    const { formatting } = resumeData;

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resume Formatting</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customize the appearance of your resume. Changes apply to all templates.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Font Settings */}
                <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="text-xl">📝</span> Font Settings
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Font Family</label>
                            <select
                                value={formatting.fontFamily}
                                onChange={(e) => updateFormatting({ fontFamily: e.target.value as any })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                            >
                                <option value="default">Default (Times New Roman)</option>
                                <option value="times">Times New Roman</option>
                                <option value="arial">Arial</option>
                                <option value="calibri">Calibri</option>
                                <option value="georgia">Georgia</option>
                                <option value="helvetica">Helvetica</option>
                                <option value="palatino">Palatino</option>
                                <option value="garamond">Garamond</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Base Font Size: <span className="text-indigo-600 dark:text-indigo-400">{formatting.baseFontSize}</span></label>
                            <select
                                value={formatting.baseFontSize}
                                onChange={(e) => updateFormatting({ baseFontSize: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                            >
                                <option value="9pt">9pt (Small)</option>
                                <option value="10pt">10pt</option>
                                <option value="11pt">11pt (Standard)</option>
                                <option value="12pt">12pt</option>
                                <option value="13pt">13pt (Large)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name Size</label>
                                <select
                                    value={formatting.nameSize}
                                    onChange={(e) => updateFormatting({ nameSize: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="huge">Huge (24pt)</option>
                                    <option value="large">Large (20pt)</option>
                                    <option value="large2">Medium (18pt)</option>
                                    <option value="normal">Normal (16pt)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title Size</label>
                                <select
                                    value={formatting.sectionTitleSize}
                                    onChange={(e) => updateFormatting({ sectionTitleSize: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="large">Large (14pt)</option>
                                    <option value="normal">Normal (12pt)</option>
                                    <option value="small">Small (11pt)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formatting.sectionTitleBold}
                                    onChange={(e) => updateFormatting({ sectionTitleBold: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-950 dark:border-slate-700"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Bold Titles</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formatting.sectionTitleUnderline}
                                    onChange={(e) => updateFormatting({ sectionTitleUnderline: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-950 dark:border-slate-700"
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Underlined Titles</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Spacing Controls */}
                <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="text-xl">📏</span> Spacing & Layout
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Line Spacing: <span className="text-indigo-600 dark:text-indigo-400">{formatting.lineSpacing}</span></label>
                            <select
                                value={formatting.lineSpacing}
                                onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                            >
                                <option value="1.0">1.0 (Tight)</option>
                                <option value="1.15">1.15</option>
                                <option value="1.3">1.3 (Default)</option>
                                <option value="1.5">1.5 (Relaxed)</option>
                                <option value="2.0">2.0 (Double)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Section Spacing</label>
                                <select
                                    value={formatting.sectionSpacing}
                                    onChange={(e) => updateFormatting({ sectionSpacing: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Paragraph Spacing</label>
                                <select
                                    value={formatting.paragraphSpacing}
                                    onChange={(e) => updateFormatting({ paragraphSpacing: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                    <option value="spacious">Spacious</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Margins (inches)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'marginTop', label: 'T' },
                                    { key: 'marginBottom', label: 'B' },
                                    { key: 'marginLeft', label: 'L' },
                                    { key: 'marginRight', label: 'R' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <input
                                            type="number"
                                            min="0.25"
                                            max="2"
                                            step="0.1"
                                            value={String(formatting[key as keyof typeof formatting])}
                                            onChange={(e) => updateFormatting({ [key]: e.target.value })}
                                            className="w-full px-2 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all text-center text-xs"
                                            title={label}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bullet & Style Options */}
                <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="text-xl">🎨</span> Style & Bullets
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bullet Style</label>
                                <select
                                    value={formatting.bulletStyle}
                                    onChange={(e) => updateFormatting({ bulletStyle: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="bullet">• Bullet</option>
                                    <option value="dash">- Dash</option>
                                    <option value="arrow">→ Arrow</option>
                                    <option value="circle">○ Circle</option>
                                    <option value="square">■ Square</option>
                                    <option value="star">★ Star</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Bullet Indent</label>
                                <select
                                    value={formatting.bulletIndent}
                                    onChange={(e) => updateFormatting({ bulletIndent: e.target.value as any })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                                >
                                    <option value="none">None</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Section Divider</label>
                            <select
                                value={formatting.sectionDividers}
                                onChange={(e) => updateFormatting({ sectionDividers: e.target.value as SectionDivider })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold transition-all"
                            >
                                <option value="none">None</option>
                                <option value="line">Single Line</option>
                                <option value="double">Double Line</option>
                                <option value="thick">Thick Line</option>
                                <option value="dotted">Dotted Line</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Color & Alignment */}
                <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                    <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="text-xl">✨</span> Colors & Header
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Color Theme</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['black', 'navy', 'darkblue', 'darkgreen', 'maroon', 'purple'] as ColorTheme[]).map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => updateFormatting({ colorTheme: theme })}
                                        className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all group ${formatting.colorTheme === theme
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="w-full h-4 rounded mb-1 shadow-inner" style={{
                                            backgroundColor:
                                                theme === 'black' ? '#000000' :
                                                    theme === 'navy' ? '#001f3f' :
                                                        theme === 'darkblue' ? '#0074D9' :
                                                            theme === 'darkgreen' ? '#2ECC40' :
                                                                theme === 'maroon' ? '#85144B' :
                                                                    '#B10DC9'
                                        }} />
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${formatting.colorTheme === theme ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {theme}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Header Alignment</label>
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
                                {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateFormatting({ headerAlignment: align })}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formatting.headerAlignment === align
                                            ? 'bg-white dark:bg-indigo-600 shadow-sm text-indigo-600 dark:text-white'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                    onClick={resetFormatting}
                    className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm"
                >
                    🔄 Reset All Formatting
                </button>
                <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 p-3 rounded-xl">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                        💡 Tip: All changes are saved automatically and synchronized across all templates.
                    </p>
                </div>
            </div>
        </div>
    );
}
