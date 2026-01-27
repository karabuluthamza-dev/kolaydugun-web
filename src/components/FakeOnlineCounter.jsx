import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const FakeOnlineCounter = ({ config }) => {
    const { t } = useLanguage();

    // Defaults if config is missing
    const mode = config?.mode || 'simulated';
    const base = parseInt(config?.base) || 150;
    const range = parseInt(config?.range) || 30;

    const [count, setCount] = useState(base);

    useEffect(() => {
        if (mode === 'static') {
            setCount(base);
            return;
        }

        if (mode === 'simulated') {
            // Initial random pos within range
            setCount(base + Math.floor(Math.random() * range * 2) - range);

            const interval = setInterval(() => {
                setCount(prev => {
                    const change = Math.floor(Math.random() * 5) - 2; // small steps
                    let next = prev + change;

                    // Keep within Base +/- Range
                    if (next > base + range) next = base + range;
                    if (next < base - range) next = base - range;

                    return next;
                });
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [mode, base, range]);

    if (mode === 'off') return null;

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" aria-hidden="true"></span>
            </span>
            <span>
                <span className="font-bold text-gray-800">{count}</span> {t('onlineCounter.text')}
            </span>
        </div>
    );
};

export default FakeOnlineCounter;
