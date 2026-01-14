import { useResumeStore } from '../store';
import { useState, useEffect } from 'react';
import { capitalizeWords } from '../utils/formatters';

export function BasicsForm() {
    const { resumeData, updateBasics } = useResumeStore();
    const { basics } = resumeData;

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
            <h3 className={`text - lg font - semibold ${darkMode ? 'text-white' : 'text-black'} `}>Profile Information</h3>

            <div>
                <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={basics.name}
                    onChange={(e) => {
                        // Only allow letters, spaces, hyphens, and apostrophes
                        const filtered = e.target.value.replace(/[^a-zA-Z\s\-']/g, '');
                        updateBasics({ name: capitalizeWords(filtered) });
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'}`}
                    placeholder="John Doe"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={basics.email}
                        onChange={(e) => {
                            // Remove spaces from email
                            const filtered = e.target.value.replace(/\s/g, '');
                            updateBasics({ email: filtered.toLowerCase() });
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'}`}
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={basics.phone}
                        onChange={(e) => {
                            // Only allow digits
                            const digits = e.target.value.replace(/\D/g, '');

                            // Auto-format as (XXX) XXX-XXXX
                            let formatted = '';
                            if (digits.length > 0) {
                                formatted = '(' + digits.substring(0, 3);
                                if (digits.length >= 3) {
                                    formatted += ') ' + digits.substring(3, 6);
                                }
                                if (digits.length >= 6) {
                                    formatted += '-' + digits.substring(6, 10);
                                }
                            }
                            updateBasics({ phone: formatted });
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'}`}
                        placeholder="(123) 456-7890"
                        maxLength={14}
                    />
                </div>
            </div>

            <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Address</label>
                <input
                    type="text"
                    value={basics.address}
                    onChange={(e) => {
                        // Only allow letters, numbers, spaces, commas, periods, hyphens
                        const filtered = e.target.value.replace(/[^a-zA-Z0-9\s,.\-]/g, '');
                        updateBasics({ address: filtered });
                    }}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'}`}
                    placeholder="New York, NY"
                />
            </div>

            <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'} `}>Websites / Links</label>
                {basics.websites.map((website, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={website.name}
                            onChange={(e) => {
                                const newWebsites = [...basics.websites];
                                newWebsites[index] = { ...website, name: e.target.value };
                                updateBasics({ websites: newWebsites });
                            }}
                            className={`flex - 1 px - 3 py - 2 border - 2 rounded - lg focus: outline - none focus: ring - 2 focus: ring - violet - 500 font - medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'} `}
                            placeholder="LinkedIn"
                        />
                        <input
                            type="url"
                            value={website.url}
                            onChange={(e) => {
                                const newWebsites = [...basics.websites];
                                newWebsites[index] = { ...website, url: e.target.value };
                                updateBasics({ websites: newWebsites });
                            }}
                            className={`flex - 1 px - 3 py - 2 border - 2 rounded - lg focus: outline - none focus: ring - 2 focus: ring - violet - 500 font - medium ${darkMode ? 'bg-black border-gray-600 text-white' : 'bg-white border-slate-400 text-black'} `}
                            placeholder="https://linkedin.com/in/johndoe"
                        />
                        <button
                            onClick={() => {
                                const newWebsites = basics.websites.filter((_, i) => i !== index);
                                updateBasics({ websites: newWebsites });
                            }}
                            className="px-3 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => {
                        updateBasics({ websites: [...basics.websites, { name: '', url: '' }] });
                    }}
                    className="mt-2 px-4 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700"
                >
                    + Add Website
                </button>
            </div>
        </div>
    );
}
