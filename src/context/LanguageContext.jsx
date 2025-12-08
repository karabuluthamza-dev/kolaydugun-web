import React, { createContext, useContext, useEffect, useState } from 'react';
// Force HMR update
import i18n from '../i18n';
import { useTranslations } from '../hooks/useTranslations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const { translations, loading } = useTranslations();
    const [language, setLanguage] = useState(i18n.language || 'de');

    // Update i18n resources when translations change
    useEffect(() => {
        if (!loading && translations) {
            // Re-generate resources for i18next
            const newResources = {
                en: { translation: {} },
                de: { translation: {} },
                tr: { translation: {} }
            };

            Object.entries(translations).forEach(([key, values]) => {
                // Handle nested keys (e.g. "nav.services")
                const parts = key.split('.');

                ['en', 'de', 'tr'].forEach(lang => {
                    let current = newResources[lang].translation;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!current[parts[i]]) current[parts[i]] = {};
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = values[lang] || values['en']; // Fallback to EN
                });
            });

            // Update i18next
            Object.keys(newResources).forEach(lang => {
                i18n.addResourceBundle(lang, 'translation', newResources[lang].translation, true, true);
            });

            // Force update
            i18n.changeLanguage(language);
        }
    }, [translations, loading, language]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLanguage(lng);
    };

    const t = (key, options) => {
        return i18n.t(key, options);
    };

    const value = {
        language,
        changeLanguage,
        t,
        loading
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
