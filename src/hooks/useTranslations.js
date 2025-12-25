import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { dictionary } from '../locales/dictionary';

export const useTranslations = () => {
    // Initialize with local dictionary immediately to prevent FOUC / missing keys
    const flattenDictionary = useCallback((dict) => {
        const flat = {};
        const traverse = (obj, path = []) => {
            if (!obj || typeof obj !== 'object') return;

            for (const key in obj) {
                try {
                    const value = obj[key];
                    if (value === null || value === undefined) continue;

                    if (typeof value === 'object' && !value.en) {
                        traverse(value, [...path, key]);
                    } else if (typeof value === 'object' && value.en) {
                        const flatKey = [...path, key].join('.');
                        flat[flatKey] = value;
                    } else if (typeof value === 'string') {
                        const flatKey = [...path, key].join('.');
                        flat[flatKey] = { en: value, de: value, tr: value };
                    }
                } catch (e) {
                    console.warn('[useTranslations] Error processing key:', key, e);
                }
            }
        };
        try {
            traverse(dict);
        } catch (e) {
            console.error('[useTranslations] Error flattening dictionary:', e);
        }
        return flat;
    }, []);

    const [translations, setTranslations] = useState(() => flattenDictionary(dictionary));
    const [loading, setLoading] = useState(false); // No loading state needed for local content
    const [error, setError] = useState(null);

    const fetchTranslations = useCallback(async () => {
        try {
            // Safety check - supabase might not be initialized
            if (!supabase) {
                console.warn('[useTranslations] Supabase not initialized, using local dictionary only');
                return;
            }
            // Background update
            const { data, error } = await supabase
                .from('translations')
                .select('*');

            if (error) throw error;

            if (data && data.length > 0) {
                const merged = flattenDictionary(dictionary);
                data.forEach(item => {
                    merged[item.key] = {
                        en: item.en,
                        de: item.de,
                        tr: item.tr
                    };
                });
                setTranslations(merged);
            }
        } catch (err) {
            console.error('Error fetching translations (using local fallback):', err);
            // No need to reset translations, already have local
        }
    }, [flattenDictionary]);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);

    // Function to update a translation (for Admin UI)
    const updateTranslation = async (key, values) => {
        console.log('Updating translation:', { key, values });
        const { data, error } = await supabase
            .from('translations')
            .upsert({
                key,
                ...values,
                updated_at: new Date()
            })
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }
        console.log('Supabase update success:', data);

        // Update local state immediately
        setTranslations(prev => ({
            ...prev,
            [key]: { ...prev[key], ...values }
        }));
    };

    return { translations, loading, error, updateTranslation, refresh: fetchTranslations };
};
