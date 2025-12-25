import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import i18n from '../i18n';
import { useTranslations } from '../hooks/useTranslations';
import { dictionary } from '../locales/dictionary';
import { community } from '../locales/community';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Wrap useTranslations in a try-catch scenario by providing a fallback
    let translationsData = { translations: {}, loading: false };
    try {
        translationsData = useTranslations();
    } catch (e) {
        console.error('[LanguageProvider] useTranslations failed, using fallback:', e);
    }
    const { translations, loading } = translationsData;
    const [language, setLanguage] = useState(i18n.language || 'de');

    // Update i18n resources when translations change
    useEffect(() => {
        // Re-generate resources for i18next
        const newResources = {
            en: { translation: {} },
            de: { translation: {} },
            tr: { translation: {} }
        };

        // 1. First add local dictionary to resources
        const mergeDictionary = (obj, prefix = '') => {
            Object.entries(obj).forEach(([key, values]) => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (values && typeof values === 'object' && ('en' in values || 'de' in values || 'tr' in values)) {
                    // This is a translation leaf
                    ['en', 'de', 'tr'].forEach(lang => {
                        const parts = fullKey.split('.');
                        let current = newResources[lang].translation;
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (!current[parts[i]]) current[parts[i]] = {};
                            current = current[parts[i]];
                        }
                        current[parts[parts.length - 1]] = values[lang] || values['de'] || values['en'] || key;
                    });
                } else if (values && typeof values === 'object') {
                    // Nested object
                    mergeDictionary(values, fullKey);
                }
            });
        };
        mergeDictionary(dictionary);

        // 2. Then add DB translations (override dictionary)
        if (!loading && translations) {
            Object.entries(translations).forEach(([key, values]) => {
                const parts = key.split('.');
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = newResources[lang].translation;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!current[parts[i]]) current[parts[i]] = {};
                        current = current[parts[i]];
                    }
                    current[parts[parts.length - 1]] = values[lang] || values['en'];
                });
            });
        }

        // Update i18next
        Object.keys(newResources).forEach(lang => {
            i18n.addResourceBundle(lang, 'translation', newResources[lang].translation, true, true);
        });

        // Force update
        i18n.changeLanguage(language);
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

                // First try in main dictionary
                for (const part of parts) {
                    if (current[part] === undefined) {
                        current = null;
                        break;
                    }
                    current = current[part];
                }

                // If not found in dictionary, try in community object
                if (current === null && parts[0] === 'community') {
                    current = community;
                    for (let i = 1; i < parts.length; i++) {
                        if (current[parts[i]] === undefined) {
                            current = null;
                            break;
                        }
                        current = current[parts[i]];
                    }
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
