import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
                // Try direct dictionary lookup as safety net
                const parts = key.split('.');
                let current = dictionary;
                for (const part of parts) {
                    if (current[part] === undefined) {
                        current = null;
                        break;
                    }
                    current = current[part];
                }

                let finalString = '';
                if (current && typeof current === 'object') {
                    finalString = current[language] || current['de'] || current['en'] || fallbackValue || key;
                } else if (typeof current === 'string') {
                    finalString = current;
                } else {
                    finalString = fallbackValue || key;
                }

                // Simple interpolation for fallback (replaces {{key}} with options.key)
                if (typeof finalString === 'string' && options && typeof options === 'object') {
                    Object.keys(options).forEach(optKey => {
                        finalString = finalString.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
                    });
                }
                return finalString;
            } catch (e) {
                console.warn('[I18N] Translation fallback failed for key:', key, e);
                return fallbackValue || key;
            }
        }
        return result;
    };

    const value = useMemo(() => ({
        language,
        changeLanguage,
        t,
        loading,
        translations
    }), [language, loading, translations]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // Find which component is calling this outside of provider
        const stack = new Error().stack;
        const callerName = stack?.split('\n')?.[2]?.trim() || 'Unknown';

        console.warn(`[CRITICAL] useLanguage was called outside of a LanguageProvider! 
            Caller: ${callerName}
            Returning fallback to prevent crash.`);

        return {
            language: i18n.language || 'tr',
            changeLanguage: (lng) => i18n.changeLanguage(lng),
            t: (key) => i18n.t(key) || key,
            loading: false,
            translations: {}
        };
    }
    return context;
};
