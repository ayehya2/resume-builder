import { useResumeStore } from '../store';
import { useState, useEffect } from 'react';
import type { ColorTheme, SectionDivider, Alignment } from '../types';

export function FormattingForm() {
    const { resumeData, updateFormatting, resetFormatting } = useResumeStore();
    const { formatting } = resumeData;

    const [darkMode, setDarkMode] = useState(false);

    // Detect dark mode from document
    useEffect(() => {
        const checkDark = () => setDarkMode(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Resume Formatting</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                Customize the appearance of your resume. Changes apply to all templates.
            </p>

            {/* Font Settings */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>📝 Font Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Font Family</label>
                        <select
                            value={formatting.fontFamily}
                            onChange={(e) => updateFormatting({ fontFamily: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
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
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Base Font Size: {formatting.baseFontSize}</label>
                        <select
                            value={formatting.baseFontSize}
                            onChange={(e) => updateFormatting({ baseFontSize: e.target.value })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="9pt">9pt (Small)</option>
                            <option value="10pt">10pt</option>
                            <option value="11pt">11pt (Standard)</option>
                            <option value="12pt">12pt</option>
                            <option value="13pt">13pt (Large)</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Name Size</label>
                        <select
                            value={formatting.nameSize}
                            onChange={(e) => updateFormatting({ nameSize: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="huge">Huge (24pt)</option>
                            <option value="large">Large (20pt)</option>
                            <option value="large2">Large-Medium (18pt)</option>
                            <option value="normal">Normal (16pt)</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Section Title Size</label>
                        <select
                            value={formatting.sectionTitleSize}
                            onChange={(e) => updateFormatting({ sectionTitleSize: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="large">Large (14pt)</option>
                            <option value="normal">Normal (12pt)</option>
                            <option value="small">Small (11pt)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formatting.sectionTitleBold}
                            onChange={(e) => updateFormatting({ sectionTitleBold: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Bold Section Titles</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formatting.sectionTitleUnderline}
                            onChange={(e) => updateFormatting({ sectionTitleUnderline: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Underline Section Titles</span>
                    </label>
                </div>
            </div>

            {/* Spacing Controls */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>📏 Spacing Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Line Spacing: {formatting.lineSpacing}</label>
                        <select
                            value={formatting.lineSpacing}
                            onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="1.0">1.0 (Tight)</option>
                            <option value="1.15">1.15</option>
                            <option value="1.3">1.3 (Default)</option>
                            <option value="1.5">1.5 (Relaxed)</option>
                            <option value="2.0">2.0 (Double)</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Section Spacing</label>
                        <select
                            value={formatting.sectionSpacing}
                            onChange={(e) => updateFormatting({ sectionSpacing: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="tight">Tight (4pt)</option>
                            <option value="normal">Normal (6pt)</option>
                            <option value="relaxed">Relaxed (8pt)</option>
                            <option value="spacious">Spacious (10pt)</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Paragraph Spacing</label>
                        <select
                            value={formatting.paragraphSpacing}
                            onChange={(e) => updateFormatting({ paragraphSpacing: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="tight">Tight (3pt)</option>
                            <option value="normal">Normal (6pt)</option>
                            <option value="relaxed">Relaxed (8pt)</option>
                            <option value="spacious">Spacious (10pt)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Margins */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>📐 Margins (inches)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { key: 'marginTop', label: 'Top' },
                        { key: 'marginBottom', label: 'Bottom' },
                        { key: 'marginLeft', label: 'Left' },
                        { key: 'marginRight', label: 'Right' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{label}</label>
                            <input
                                type="number"
                                min="0.25"
                                max="2"
                                step="0.1"
                                value={String(formatting[key as keyof typeof formatting])}
                                onChange={(e) => updateFormatting({ [key]: e.target.value })}
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bullet & Style Options */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>• Bullet & Style Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Bullet Style</label>
                        <select
                            value={formatting.bulletStyle}
                            onChange={(e) => updateFormatting({ bulletStyle: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="bullet">• Bullet</option>
                            <option value="dash">- Dash</option>
                            <option value="arrow">→ Arrow</option>
                            <option value="circle">○ Circle</option>
                            <option value="square">■ Square</option>
                            <option value="diamond">◆ Diamond</option>
                            <option value="star">★ Star</option>
                            <option value="chevron">› Chevron</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Bullet Indentation</label>
                        <select
                            value={formatting.bulletIndent}
                            onChange={(e) => updateFormatting({ bulletIndent: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="none">None</option>
                            <option value="small">Small (0.2in)</option>
                            <option value="medium">Medium (0.4in)</option>
                            <option value="large">Large (0.6in)</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Contact Info Separator
                        </label>
                        <select
                            value={formatting.separator}
                            onChange={(e) => updateFormatting({ separator: e.target.value as '•' | '|' })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="•">Bullet (•)</option>
                            <option value="|">Pipe (|)</option>
                        </select>
                        <p className={`text-xs mt-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                            Used throughout resume for contact info and separators
                        </p>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Header Line Style</label>
                        <select
                            value={formatting.headerLineStyle}
                            onChange={(e) => updateFormatting({ headerLineStyle: e.target.value as any })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="none">None</option>
                            <option value="thin">Thin Line</option>
                            <option value="medium">Medium Line</option>
                            <option value="thick">Thick Line</option>
                            <option value="double">Double Line</option>
                            <option value="dotted">Dotted Line</option>
                            <option value="dashed">Dashed Line</option>
                        </select>
                    </div>

                    <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Section Divider</label>
                        <select
                            value={formatting.sectionDividers}
                            onChange={(e) => updateFormatting({ sectionDividers: e.target.value as SectionDivider })}
                            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold`}
                        >
                            <option value="none">None</option>
                            <option value="line">Single Line</option>
                            <option value="double">Double Line</option>
                            <option value="thick">Thick Line</option>
                            <option value="dotted">Dotted Line</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>🎨 Color Theme</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(['black', 'navy', 'darkblue', 'darkgreen', 'maroon', 'purple'] as ColorTheme[]).map((theme) => (
                        <button
                            key={theme}
                            onClick={() => updateFormatting({ colorTheme: theme })}
                            className={`px-4 py-3 rounded-lg font-bold border-2 ${formatting.colorTheme === theme
                                ? 'border-violet-600 bg-violet-100 text-black'
                                : darkMode
                                    ? 'border-gray-600 bg-black hover:border-violet-400 text-white'
                                    : 'border-slate-300 bg-white hover:border-violet-300 text-black'
                                }`}
                        >
                            <div className="w-full h-6 rounded mb-2" style={{
                                backgroundColor:
                                    theme === 'black' ? '#000000' :
                                        theme === 'navy' ? '#001f3f' :
                                            theme === 'darkblue' ? '#0074D9' :
                                                theme === 'darkgreen' ? '#2ECC40' :
                                                    theme === 'maroon' ? '#85144B' :
                                                        '#B10DC9'
                            }} />
                            <span className="text-xs capitalize">{theme}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Header Alignment */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>📍 Header Alignment</h4>
                <div className="flex gap-3">
                    {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                        <button
                            key={align}
                            onClick={() => updateFormatting({ headerAlignment: align })}
                            className={`flex-1 px-4 py-2 rounded-lg font-bold border-2 ${formatting.headerAlignment === align
                                ? 'border-violet-600 bg-violet-100 text-black'
                                : darkMode
                                    ? 'border-gray-600 bg-black hover:border-violet-400 text-white'
                                    : 'border-slate-300 bg-white hover:border-violet-300 text-black'
                                }`}
                        >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-red-600' : 'bg-red-50 border-red-200'}`}>
                <button
                    onClick={resetFormatting}
                    className={`w-full px-4 py-3 rounded-lg font-bold transition-colors ${darkMode ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                >
                    🔄 Reset All Formatting to Defaults
                </button>
            </div>

            {/* Info Box */}
            <div className={`p-4 rounded-lg border-2 ${darkMode ? 'bg-black border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-black'}`}>
                    💡 <strong>Tip:</strong> Preview changes in real-time! Experiment to find your perfect style.
                </p>
            </div>
        </div>
    );
}
