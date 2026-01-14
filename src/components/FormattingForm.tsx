import { useResumeStore } from '../store';
import type { FormattingOptions, FontFamily, NameSize, SectionTitleSize, Spacing, BulletStyle, ColorTheme, SectionDivider, Alignment } from '../types';

export function FormattingForm() {
    const { resumeData, updateFormatting } = useResumeStore();
    const { formatting } = resumedata;


    return (
        <div className="space-y-6 max-w-4xl">
            <h3 className="text-lg font-bold text-black">Resume Formatting</h3>
            <p className="text-sm text-slate-600 font-semibold">Customize the appearance of your resume. Changes apply to all templates.</p>

            {/* Font Family */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">📝 Font Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Font Family</label>
                        <select
                            value={formatting.fontFamily}
                            onChange={(e) => updateFormatting({ fontFamily: e.target.value as FontFamily })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
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
                        <label className="block text-sm font-semibold mb-2 text-black">Base Font Size: {formatting.baseFontSize}</label>
                        <input
                            type="range"
                            min="9"
                            max="14"
                            value={parseInt(formatting.baseFontSize)}
                            onChange={(e) => updateFormatting({ baseFontSize: `${e.target.value}pt` })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-600 font-semibold">
                            <span>9pt</span>
                            <span>14pt</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Name Size</label>
                        <select
                            value={formatting.nameSize}
                            onChange={(e) => updateFormatting({ nameSize: e.target.value as NameSize })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        >
                            <option value="huge">Huge (24-28pt)</option>
                            <option value="large">Large (20-22pt)</option>
                            <option value="large2">Large 2 (18pt)</option>
                            <option value="normal">Normal (16pt)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Section Title Size</label>
                        <select
                            value={formatting.sectionTitleSize}
                            onChange={(e) => updateFormatting({ sectionTitleSize: e.target.value as SectionTitleSize })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        >
                            <option value="large">Large (14-16pt)</option>
                            <option value="normal">Normal (12pt)</option>
                            <option value="small">Small (11pt)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Spacing Controls */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">📏 Spacing Controls</h4>

                <div>
                    <label className="block text-sm font-semibold mb-2 text-black">Line Spacing: {formatting.lineSpacing}</label>
                    <input
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.05"
                        value={parseFloat(formatting.lineSpacing)}
                        onChange={(e) => updateFormatting({ lineSpacing: e.target.value })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-600 font-semibold">
                        <span>1.0 (Tight)</span>
                        <span>2.0 (Double)</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Section Spacing</label>
                        <select
                            value={formatting.sectionSpacing}
                            onChange={(e) => updateFormatting({ sectionSpacing: e.target.value as Spacing })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        >
                            <option value="tight">Tight</option>
                            <option value="normal">Normal</option>
                            <option value="relaxed">Relaxed</option>
                            <option value="spacious">Spacious</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Paragraph Spacing</label>
                        <select
                            value={formatting.paragraphSpacing}
                            onChange={(e) => updateFormatting({ paragraphSpacing: e.target.value as Spacing })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        >
                            <option value="tight">Tight</option>
                            <option value="normal">Normal</option>
                            <option value="relaxed">Relaxed</option>
                            <option value="spacious">Spacious</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Margins */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">📐 Margins (inches)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Top</label>
                        <input
                            type="number"
                            min="0.3"
                            max="2"
                            step="0.1"
                            value={formatting.marginTop}
                            onChange={(e) => updateFormatting({ marginTop: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Bottom</label>
                        <input
                            type="number"
                            min="0.3"
                            max="2"
                            step="0.1"
                            value={formatting.marginBottom}
                            onChange={(e) => updateFormatting({ marginBottom: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Left</label>
                        <input
                            type="number"
                            min="0.3"
                            max="2"
                            step="0.1"
                            value={formatting.marginLeft}
                            onChange={(e) => updateFormatting({ marginLeft: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Right</label>
                        <input
                            type="number"
                            min="0.3"
                            max="2"
                            step="0.1"
                            value={formatting.marginRight}
                            onChange={(e) => updateFormatting({ marginRight: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Bullets & Style */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">• Bullet & Style Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-black">Bullet Style</label>
                        <select
                            value={formatting.bulletStyle}
                            onChange={(e) => updateFormatting({ bulletStyle: e.target.value as BulletStyle })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
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
                        <label className="block text-sm font-semibold mb-2 text-black">Section Divider</label>
                        <select
                            value={formatting.sectionDividers}
                            onChange={(e) => updateFormatting({ sectionDividers: e.target.value as SectionDivider })}
                            className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold"
                        >
                            <option value="none">None</option>
                            <option value="line">Single Line</option>
                            <option value="double">Double Line</option>
                            <option value="thick">Thick Line</option>
                            <option value="dotted">Dotted Line</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formatting.sectionTitleBold}
                            onChange={(e) => updateFormatting({ sectionTitleBold: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-black">Bold Section Titles</span>
                    </label>
                    <label className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            checked={formatting.sectionTitleUnderline}
                            onChange={(e) => updateFormatting({ sectionTitleUnderline: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-black">Underline Section Titles</span>
                    </label>
                </div>
            </div>

            {/* Colors */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">🎨 Color Theme</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['black', 'navy', 'darkblue', 'darkgreen', 'maroon', 'purple'] as ColorTheme[]).map((theme) => (
                        <button
                            key={theme}
                            onClick={() => updateFormatting({ colorTheme: theme })}
                            className={`px-4 py-3 rounded-lg font-bold border-2 ${formatting.colorTheme === theme
                                ? 'border-violet-600 bg-violet-100'
                                : 'border-slate-300 bg-white hover:border-violet-300'
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

                {formatting.colorTheme === 'custom' && (
                    <div className="mt-4">
                        <label className="block text-sm font-semibold mb-2 text-black">Custom Color</label>
                        <input
                            type="color"
                            value={formatting.customColor}
                            onChange={(e) => updateFormatting({ customColor: e.target.value })}
                            className="w-full h-12 border-2 border-slate-400 rounded-lg cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* Header Alignment */}
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                <h4 className="font-bold text-black mb-3">📍 Header Alignment</h4>
                <div className="flex gap-3">
                    {(['left', 'center', 'right'] as Alignment[]).map((align) => (
                        <button
                            key={align}
                            onClick={() => updateFormatting({ headerAlignment: align })}
                            className={`flex-1 px-4 py-3 rounded-lg font-bold border-2 ${formatting.headerAlignment === align
                                ? 'border-violet-600 bg-violet-100'
                                : 'border-slate-300 bg-white hover:border-violet-300'
                                }`}
                        >
                            <span className="capitalize">{align}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-black">
                    💡 <strong>Tip:</strong> Changes apply immediately to the live preview. Experiment with different combinations to find your perfect style!
                </p>
            </div>
        </div>
    );
}
