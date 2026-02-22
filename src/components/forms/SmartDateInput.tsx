import React, { useMemo } from 'react';

/**
 * SmartDateInput - A professional date picker component that matches the app's aesthetic.
 * Uses high-quality styled selects for Month/Year (resumes) and Full Date (cover letters).
 * Fully matches the application theme and supports "Present" seamlessly.
 */

interface SmartDateInputProps {
    value: string;
    onChange: (value: string) => void;
    type: 'month' | 'date'; // 'month' for resume (MMM YYYY), 'date' for cover letter (MMMM D, YYYY)
    showPresent?: boolean;
    placeholder?: string;
    label?: string;
    className?: string;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function SmartDateInput({
    value,
    onChange,
    type,
    showPresent = false,
    label,
    className = '',
}: SmartDateInputProps) {
    // Current year + some future for graduation etc.
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const y = [];
        for (let i = currentYear + 10; i >= 1950; i--) {
            y.push(i.toString());
        }
        return y;
    }, [currentYear]);

    // Parse current value
    const parsedDate = useMemo(() => {
        if (!value) return { month: '', year: '', day: '' };
        if (value.toLowerCase() === 'present' || value.toLowerCase() === 'currently' || value.toLowerCase() === 'ongoing') {
            return { month: '', year: value, day: '' };
        }

        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                // Try manual parsing if Date fails (for "Jan 2020" style)
                const parts = value.split(' ');
                if (parts.length === 2) {
                    const mIdx = MONTHS_SHORT.findIndex(m => m.toLowerCase() === parts[0].toLowerCase()) + 1;
                    if (mIdx > 0) return { month: mIdx.toString(), year: parts[1], day: '1' };
                }
                return { month: '', year: '', day: '' };
            }

            return {
                month: (date.getMonth() + 1).toString(),
                year: date.getFullYear().toString(),
                day: date.getDate().toString()
            };
        } catch {
            return { month: '', year: '', day: '' };
        }
    }, [value]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const m = e.target.value;
        if (!m) return;

        if (parsedDate.year.toLowerCase() === 'present' || parsedDate.year.toLowerCase() === 'ongoing') {
            // If they pick a month, they probably want to pick a year too, so reset year
            updateValue(m, currentYear.toString(), parsedDate.day || '1');
        } else {
            updateValue(m, parsedDate.year || currentYear.toString(), parsedDate.day || '1');
        }
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const y = e.target.value;
        if (!y) {
            onChange('');
            return;
        }

        if (y.toLowerCase() === 'present' || y.toLowerCase() === 'ongoing') {
            onChange(y.charAt(0).toUpperCase() + y.slice(1).toLowerCase());
            return;
        }

        updateValue(parsedDate.month || '1', y, parsedDate.day || '1');
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const d = e.target.value;
        if (!d) return;
        updateValue(parsedDate.month || '1', parsedDate.year || currentYear.toString(), d);
    };

    const updateValue = (m: string, y: string, d: string) => {
        const monthIdx = parseInt(m) - 1;
        const yearNum = parseInt(y);
        const dayNum = parseInt(d);

        if (type === 'month') {
            onChange(`${MONTHS_SHORT[monthIdx]} ${yearNum}`);
        } else {
            const date = new Date(yearNum, monthIdx, dayNum);
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            onChange(new Intl.DateTimeFormat('en-US', options).format(date));
        }
    };

    const selectBaseClasses = "px-3 py-1.5 sm:py-2 border-2 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium transition-all appearance-none cursor-pointer h-[38px] sm:h-[42px]";

    const isSpecialYear = parsedDate.year.toLowerCase() === 'present' || parsedDate.year.toLowerCase() === 'ongoing';

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {label}
                </label>
            )}

            <div className="flex gap-2">
                {/* Month Dropdown */}
                <div className={`relative flex-1 ${isSpecialYear ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    <select
                        value={parsedDate.month}
                        onChange={handleMonthChange}
                        className={`${selectBaseClasses} w-full`}
                    >
                        <option value="" disabled>Month</option>
                        {(type === 'month' ? MONTHS_SHORT : MONTHS_FULL).map((m, i) => (
                            <option key={m} value={(i + 1).toString()}>{m}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Day Dropdown (Only for 'date' type) */}
                {type === 'date' && (
                    <div className={`relative w-20 ${isSpecialYear ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                        <select
                            value={parsedDate.day}
                            onChange={handleDayChange}
                            className={`${selectBaseClasses} w-full`}
                        >
                            <option value="" disabled>Day</option>
                            {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Year Dropdown */}
                <div className="relative flex-1">
                    <select
                        value={parsedDate.year}
                        onChange={handleYearChange}
                        className={`${selectBaseClasses} w-full`}
                    >
                        <option value="" disabled>Year</option>
                        {showPresent && (
                            <>
                                <option value="Present">Present</option>
                                <option value="Ongoing">Ongoing</option>
                                <option disabled>──────────</option>
                            </>
                        )}
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
