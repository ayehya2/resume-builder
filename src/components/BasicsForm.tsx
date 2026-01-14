import { useResumeStore } from '../store';
import { useState, useEffect } from 'react';
import { emailSchema, phoneSchema } from '../utils/validation';
import { capitalizeWords } from '../utils/formatters';

export function BasicsForm() {
    const { resumeData, updateBasics } = useResumeStore();
    const { basics } = resumeData;

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [darkMode, setDarkMode] = useState(false);

    // Detect dark mode from document
    useEffect(() => {
        const checkDark = () => setDarkMode(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const validateAndUpdate = (field: string, value: any, schema: any) => {
        const result = schema.safeParse(value);

        if (result.success) {
            setErrors(prev => ({ ...prev, [field]: '' }));
            return result.data;
        } else {
            setErrors(prev => ({ ...prev, [field]: result.error.issues[0]?.message || 'Invalid' }));
            return value;
        }
    };

    const handleNameChange = (value: string) => {
        updateBasics({ name: capitalizeWords(value) });
    };

    const handleEmailBlur = () => {
        validateAndUpdate('email', basics.email, emailSchema);
    };

    const handlePhoneChange = (value: string) => {
        updateBasics({ phone: value });
    };

    const handlePhoneBlur = () => {
        const validatedPhone = validateAndUpdate('phone', basics.phone, phoneSchema);
        if (validatedPhone) {
            updateBasics({ phone: validatedPhone });
        }
    };

    return (
        <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Profile Information</h3>

            <div>
                <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Full Name *</label>
                <input
                    type="text"
                    value={basics.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                        }`}
                    placeholder="John Doe"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Email *</label>
                    <input
                        type="email"
                        value={basics.email}
                        onChange={(e) => updateBasics({ email: e.target.value })}
                        onBlur={handleEmailBlur}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${errors.email
                                ? 'border-red-500'
                                : darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                            }`}
                        placeholder="john@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ {errors.email}</p>
                    )}
                </div>

                <div>
                    <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Phone *</label>
                    <input
                        type="tel"
                        value={basics.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={handlePhoneBlur}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${errors.phone
                                ? 'border-red-500'
                                : darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                            }`}
                        placeholder="(123) 456-7890"
                        maxLength={14}
                    />
                    {errors.phone && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">⚠️ {errors.phone}</p>
                    )}
                </div>
            </div>

            <div>
                <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Address</label>
                <input
                    type="text"
                    value={basics.address}
                    onChange={(e) => updateBasics({ address: e.target.value })}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                        }`}
                    placeholder="New York, NY"
                />
            </div>

            <div>
                <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Contact Separator</label>
                <select
                    value={basics.separator || '•'}
                    onChange={(e) => updateBasics({ separator: e.target.value as '•' | '|' })}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                        }`}
                >
                    <option value="•">Bullet (•)</option>
                    <option value="|">Pipe (|)</option>
                </select>
                <p className={`text-xs mt-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Preview: {basics.email} {basics.separator || '•'} {basics.phone} {basics.separator || '•'} {basics.address}
                </p>
            </div>

            <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-black'}`}>Websites / Links</label>
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
                            className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                                }`}
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
                            className={`flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-slate-400 text-black'
                                }`}
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
