import { useResumeStore } from '../store';
import { formatPhoneNumber, capitalizeWords } from '../utils/formatters';

export function BasicsForm() {
    const { resumeData, updateBasics } = useResumeStore();
    const { basics } = resumeData;

    const handleNameChange = (value: string) => {
        updateBasics({ name: capitalizeWords(value) });
    };

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhoneNumber(value);
        updateBasics({ phone: formatted });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Profile Information</h3>

            <div>
                <label className="block text-sm font-semibold mb-1 text-black">Full Name *</label>
                <input
                    type="text"
                    value={basics.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                    placeholder="John Doe"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-black">Email *</label>
                    <input
                        type="email"
                        value={basics.email}
                        onChange={(e) => updateBasics({ email: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                        placeholder="john@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-black">Phone *</label>
                    <input
                        type="tel"
                        value={basics.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                        placeholder="(123) 456-7890"
                        maxLength={14}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-black">Address</label>
                <input
                    type="text"
                    value={basics.address}
                    onChange={(e) => updateBasics({ address: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
                    placeholder="New York, NY"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-black">Contact Separator</label>
                <select
                    value={basics.separator || '•'}
                    onChange={(e) => updateBasics({ separator: e.target.value as '•' | '|' })}
                    className="w-full px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-bold"
                >
                    <option value="•">Bullet (•)</option>
                    <option value="|">Pipe (|)</option>
                </select>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                    Preview: {basics.email} {basics.separator || '•'} {basics.phone} {basics.separator || '•'} {basics.address}
                </p>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-2 text-black">Websites / Links</label>
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
                            className="flex-1 px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
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
                            className="flex-1 px-3 py-2 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-black font-medium"
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
