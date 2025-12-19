import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { dictionary } from './locales/dictionary';

// Helper to transform unified dictionary into i18next resources
const generateResources = (dict) => {
    const resources = {
        en: { translation: {} },
        de: { translation: {} },
        tr: { translation: {} }
    };

    const traverse = (obj, path = []) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            const value = obj[key];
            if (value === null || value === undefined) continue;

            if (typeof value === 'object' && !value.en) {
                // Nested object, recurse
                traverse(value, [...path, key]);
            } else if (typeof value === 'object' && value.en) {
                // Leaf node with translations
                const currentPath = [...path, key];

                // Assign to each language
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = resources[lang].translation;
                    for (let i = 0; i < currentPath.length - 1; i++) {
                        if (!current[currentPath[i]]) current[currentPath[i]] = {};
                        current = current[currentPath[i]];
                    }
                    current[currentPath[currentPath.length - 1]] = value[lang] || value.en || value.de || '';
                });
            }
        }
    };

    traverse(dict);
    return resources;
};

const resources = generateResources(dictionary);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'de',
        supportedLngs: ['en', 'de', 'tr'],
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
