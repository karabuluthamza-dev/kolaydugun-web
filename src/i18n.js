import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { dictionary } from './locales/dictionary';
import { community } from './locales/community';

// Merge community translations into dictionary
const mergedDictionary = {
    ...dictionary,
    community: community
};

const generateResources = (dict) => {
    const resources = {
        en: { translation: {} },
        de: { translation: {} },
        tr: { translation: {} }
    };

    const isLeafNode = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        return (typeof obj.en === 'string' || typeof obj.de === 'string' || typeof obj.tr === 'string');
    };

    const traverse = (obj, path = []) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            const value = obj[key];
            if (value === null || value === undefined) continue;

            if (isLeafNode(value)) {
                const currentPath = [...path, key];
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = resources[lang].translation;
                    for (let i = 0; i < currentPath.length - 1; i++) {
                        if (!current[currentPath[i]]) current[currentPath[i]] = {};
                        current = current[currentPath[i]];
                    }
                    current[currentPath[currentPath.length - 1]] = value[lang] || value.en || value.de || '';
                });
            } else if (typeof value === 'object') {
                traverse(value, [...path, key]);
            }
        }
    };

    traverse(dict);
    return resources;
};

const resources = generateResources(mergedDictionary);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'de',
        supportedLngs: ['en', 'de', 'tr'],
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
