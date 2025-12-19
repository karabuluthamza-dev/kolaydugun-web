import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';
import { useTranslations } from '../hooks/useTranslations';
import { dictionary } from '../locales/dictionary';
import { community } from '../locales/community';

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
        // Handle both t(key, fallbackString) and t(key, {defaultValue: ...}) patterns
        let fallbackValue = null;
        if (typeof options === 'string') {
            fallbackValue = options;
        } else if (options && typeof options === 'object' && options.defaultValue) {
            fallbackValue = options.defaultValue;
        }

        const result = i18n.t(key, options);

        // If translation failed (returns key, empty, or used the provided fallback), try direct dictionary lookup
        const translationFailed = result === key || !result || result === fallbackValue;

        if (translationFailed) {
            try {
                const parts = key.split('.');
                let current;
                let startIndex = 0;

                // FORCE FALLBACK for community to bypass potential i18n/context staleness
                if (parts[0] === 'community') {
                    current = community; // Use the imported community object
                    startIndex = 1; // Start traversing from the second part
                } else {
                    current = dictionary; // Default to dictionary
                }

                for (let i = startIndex; i < parts.length; i++) {
                    const part = parts[i];
                    if (current && typeof current === 'object' && current[part]) {
                        current = current[part];
                    } else {
                        // Key path not found, return fallback or key
                        return fallbackValue || key;
                    }
                }

                // Current should now be the translation object {en:..., tr:..., de:...}
                if (current && typeof current === 'object') {
                    const lang = language || i18n.language || 'tr';
                    const translation = current[lang] || current['en'];
                    return translation || fallbackValue || key;
                }
            } catch (e) {
                console.warn('Translation fallback failed:', e);
                return fallbackValue || key;
            }
        }

        return result;
    };

    const value = {
        language,
        changeLanguage,
        t,
        loading
    };

    console.log('[DEBUG] LanguageProvider rendering with value:', { language, loading });

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        console.warn('[CRITICAL] useLanguage was called outside of a LanguageProvider! Returning fallback to prevent crash.');
        return {
            language: 'tr',
            changeLanguage: () => { },
            t: (key) => key,
            loading: false
        };
    }
    return context;
};
