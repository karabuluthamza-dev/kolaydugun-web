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

// Helper to transform unified dictionary into i18next resources
const generateResources = (dict) => {
    const resources = {
        en: { translation: {} },
        de: { translation: {} },
        tr: { translation: {} }
    };

    console.log('[i18n] Dictionary top-level keys:', Object.keys(dict));

    const isLeafNode = (obj) => {
        // A leaf node is an object that has at least one language key (en, de, or tr) with a string value
        if (!obj || typeof obj !== 'object') return false;
        return (typeof obj.en === 'string' || typeof obj.de === 'string' || typeof obj.tr === 'string');
    };

    const traverse = (obj, path = []) => {
        if (!obj || typeof obj !== 'object') return;

        for (const key in obj) {
            const value = obj[key];
            if (value === null || value === undefined) continue;

            if (isLeafNode(value)) {
                // Leaf node with translations
                const currentPath = [...path, key];
                const fullPath = currentPath.join('.');

                // Debug: Log when we find a leaf node
                if (path[0] === 'filters' || path[0] === 'dashboard') {
                    console.log(`[i18n] Found leaf node: ${fullPath}`, value);
                }

                // Assign to each language
                ['en', 'de', 'tr'].forEach(lang => {
                    let current = resources[lang].translation;
                    for (let i = 0; i < currentPath.length - 1; i++) {
                        if (!current[currentPath[i]]) current[currentPath[i]] = {};
                        current = current[currentPath[i]];
                    }
                    current[currentPath[currentPath.length - 1]] = value[lang] || value.en || value.de || '';
                });
            } else if (typeof value === 'object') {
                // Nested object, recurse
                traverse(value, [...path, key]);
            }
        }
    };

    traverse(dict);

    // Debug: Log final structure for filters and dashboard
    console.log('[i18n] Final filters structure:', {
        tr: resources.tr.translation.filters,
        en: resources.en.translation.filters,
        de: resources.de.translation.filters
    });
    console.log('[i18n] Final dashboard structure:', {
        tr: resources.tr.translation.dashboard,
        en: resources.en.translation.dashboard,
        de: resources.de.translation.dashboard
    });

    return resources;
};

const resources = generateResources(mergedDictionary);

// DEBUG: Check if translations are loaded
console.log('[i18n DEBUG] Translations loaded:', {
    tr_filters: resources.tr?.translation?.filters,
    de_filters: resources.de?.translation?.filters,
    en_filters: resources.en?.translation?.filters,
    tr_dashboard: resources.tr?.translation?.dashboard,
    de_dashboard: resources.de?.translation?.dashboard,
    en_dashboard: resources.en?.translation?.dashboard,
    tr_community: resources.tr?.translation?.community,
    de_community: resources.de?.translation?.community,
    en_community: resources.en?.translation?.community,
    tr_shop: resources.tr?.translation?.shop,
    de_shop: resources.de?.translation?.shop,
    en_shop: resources.en?.translation?.shop,
    tr_planningTools: resources.tr?.translation?.planningTools,
    de_planningTools: resources.de?.translation?.planningTools,
    en_planningTools: resources.en?.translation?.planningTools
});


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
