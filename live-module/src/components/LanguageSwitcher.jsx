import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);

    const languages = [
        { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'en', label: 'English', flag: '🇺🇸' }
    ];

    const currentLang = languages.find(l => l.code === (i18n.language?.split('-')[0] || 'de')) || languages[1];

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-4 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl min-w-[140px]"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${i18n.language?.startsWith(lang.code)
                                        ? 'bg-prime/10 text-prime'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="font-bold text-xs uppercase tracking-widest">{lang.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-xl group"
            >
                <Globe className={`w-6 h-6 transform transition-transform duration-500 ${isOpen ? 'rotate-180 text-prime' : ''}`} />
            </button>
        </div>
    );
};

export default LanguageSwitcher;
