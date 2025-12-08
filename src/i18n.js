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
        for (const key in obj) {
            if (typeof obj[key] === 'object' && !obj[key].en) {
                // Nested object, recurse
                traverse(obj[key], [...path, key]);
            } else if (typeof obj[key] === 'object' && obj[key].en) {
                // Leaf node with translations
                const currentPath = [...path, key];

                // Assign to each language
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = resources[lang].translation;
                    for (let i = 0; i < currentPath.length - 1; i++) {
                        if (!current[currentPath[i]]) current[currentPath[i]] = {};
                        current = current[currentPath[i]];
                    }
                    current[currentPath[currentPath.length - 1]] = obj[key][lang];
                });
            } else if (typeof obj[key] === 'string') {
                // Direct string (fallback or legacy structure), skip or handle as needed
                // In our strict dictionary, this shouldn't happen for leaf nodes
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
