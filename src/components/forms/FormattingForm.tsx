import { useResumeStore } from '../../store'
import type { ColorTheme, SectionDivider, Alignment, FontFamily, NameSize, Spacing, BulletStyle } from '../../types';

export function FormattingForm() {
    const { resumeData, updateFormatting, resetFormatting } = useResumeStore();
    const { formatting } = resumeData;

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Extensive Resume Formatting</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Deep customization for professional-grade resumes. Changes apply to all templates.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Typography */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        Typography & Case
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Font Family</label>
                            <select
                                value={formatting.fontFamily}
                                onChange={(e) => updateFormatting({ fontFamily: e.target.value as FontFamily })}
                                className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name Size</label>
                                <select
                                    value={formatting.nameSize}
                                    onChange={(e) => updateFormatting({ nameSize: e.target.value as NameSize })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="huge">Huge (24pt)</option>
                                    <option value="large">Large (20pt)</option>
                                    <option value="large2">Medium (18pt)</option>
                                    <option value="normal">Normal (16pt)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name Weight</label>
                                <select
                                    value={formatting.fontWeightName}
                                    onChange={(e) => updateFormatting({ fontWeightName: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="LIGHT">Light</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="BOLD">Bold</option>
                                    <option value="HEAVY">Heavy</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Case</label>
                                <select
                                    value={formatting.sectionHeaderStyle}
                                    onChange={(e) => updateFormatting({ sectionHeaderStyle: e.target.value as 'uppercase' | 'capitalize' | 'normal' })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="uppercase">ALL CAPS</option>
                                    <option value="capitalize">Capitalize Case</option>
                                    <option value="normal">Normal Case</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Title Weight</label>
                                <select
                                    value={formatting.fontWeightSectionTitle}
                                    onChange={(e) => updateFormatting({ fontWeightSectionTitle: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="NORMAL">Normal</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="BOLD">Bold</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formatting.sectionTitleUnderline}
                                    onChange={(e) => updateFormatting({ sectionTitleUnderline: e.target.checked })}
                                    className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Underline Titles</span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section 2: Layout & Spacing */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        Layout & Spacing
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Page Size</label>
                                <select
                                    value={formatting.pageFormat}
                                    onChange={(e) => updateFormatting({ pageFormat: e.target.value as 'Letter' | 'A4' })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="Letter">Letter (US)</option>
                                    <option value="A4">A4 (ISO)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Line Height</label>
                                <select
                                    value={formatting.lineSpacing}
                                    onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="1.0">1.0 Tight</option>
                                    <option value="1.15">1.15</option>
                                    <option value="1.2">1.2 Regular</option>
                                    <option value="1.5">1.5 Loose</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Gap</label>
                                <select
                                    value={formatting.sectionSpacing}
                                    onChange={(e) => updateFormatting({ sectionSpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="tight">Tight (4pt)</option>
                                    <option value="normal">Normal (6pt)</option>
                                    <option value="relaxed">Relaxed (10pt)</option>
                                    <option value="spacious">Spacious (16pt)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Entry Gap (Work/Edu)</label>
                                <select
                                    value={formatting.entrySpacing}
                                    onChange={(e) => updateFormatting({ entrySpacing: e.target.value as Spacing })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="relaxed">Relaxed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Margins (inches)</label>
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
                                            step="0.05"
                                            value={String(formatting[key as keyof typeof formatting])}
                                            onChange={(e) => updateFormatting({ [key]: e.target.value })}
                                            className="w-full px-2 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all text-center text-xs"
                                            title={label}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Bullets & Icons */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        Bullets & Icons
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bullet Style</label>
                                <select
                                    value={formatting.bulletStyle}
                                    onChange={(e) => updateFormatting({ bulletStyle: e.target.value as BulletStyle })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="bullet">Bullet</option>
                                    <option value="dash">Dash</option>
                                    <option value="arrow">Arrow</option>
                                    <option value="circle">Circle</option>
                                    <option value="square">Square</option>
                                    <option value="diamond">Diamond</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bullet Gap</label>
                                <select
                                    value={formatting.bulletGap}
                                    onChange={(e) => updateFormatting({ bulletGap: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="2pt">Tight (2pt)</option>
                                    <option value="4pt">Normal (4pt)</option>
                                    <option value="8pt">Spacious (8pt)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Social Icons</label>
                                <select
                                    value={formatting.socialIconStyle}
                                    onChange={(e) => updateFormatting({ socialIconStyle: e.target.value as 'circle' | 'square' | 'none' })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="none">Text Only</option>
                                    <option value="square">Square Icons</option>
                                    <option value="circle">Circle Icons</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1.5">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formatting.showIcons}
                                        onChange={(e) => updateFormatting({ showIcons: e.target.checked })}
                                        className="w-4 h-4 border-slate-300 text-slate-700 focus:ring-slate-500 dark:bg-slate-950 dark:border-slate-600"
                                    />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Contact Icons</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Decorative & Colors */}
                <section className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        Decorative & Style
                    </h4>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Section Divider</label>
                                <select
                                    value={formatting.sectionDividers}
                                    onChange={(e) => updateFormatting({ sectionDividers: e.target.value as SectionDivider })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="none">None</option>
                                    <option value="line">Thin Line</option>
                                    <option value="thick">Thick Line</option>
                                    <option value="double">Double Line</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Separator Char</label>
                                <select
                                    value={formatting.separator}
                                    onChange={(e) => updateFormatting({ separator: e.target.value as '•' | '|' | '·' | '—' })}
                                    className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold transition-all"
                                >
                                    <option value="•">Bullet</option>
                                    <option value="|">Pipe</option>
                                    <option value="·">Dot</option>
                                    <option value="—">Dash</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Header Alignment</label>
                            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950">
                                {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateFormatting({ headerAlignment: align })}
                                        className={`flex-1 py-1 px-3 text-sm font-semibold transition-all ${formatting.headerAlignment === align
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Color Theme</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['black', 'navy', 'darkblue', 'darkgreen', 'maroon', 'purple'] as ColorTheme[]).map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => updateFormatting({ colorTheme: theme })}
                                        className={`flex flex-col items-center p-2 border-2 transition-all group ${formatting.colorTheme === theme
                                            ? 'border-slate-800 bg-slate-100 dark:bg-slate-800'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="w-full h-3 mb-1 shadow-inner" style={{
                                            backgroundColor:
                                                theme === 'black' ? '#000000' :
                                                    theme === 'navy' ? '#001f3f' :
                                                        theme === 'darkblue' ? '#0074D9' :
                                                            theme === 'darkgreen' ? '#2ECC40' :
                                                                theme === 'maroon' ? '#85144B' :
                                                                    '#B10DC9'
                                        }} />
                                        <span className={`text-[9px] font-semibold uppercase tracking-widest ${formatting.colorTheme === theme ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {theme}
                                        </span>
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
                    className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-2 border-red-100 dark:border-red-900/30 font-semibold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all shadow-sm"
                >
                    Reset All Formatting
                </button>
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        High Precision: All numerical values support decimal points for perfect alignment.
                    </p>
                </div>
            </div>
        </div>
    );
}
