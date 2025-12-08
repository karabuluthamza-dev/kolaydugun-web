import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useSiteSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .single();

                if (error) {
                    // Check if error is due to table not existing yet (handling migration delay)
                    if (error.code === '42P01') {
                        console.warn('site_settings table not found, waiting for migration.');
                        setSettings(null);
                    } else {
                        throw error;
                    }
                } else {
                    setSettings(data);
                }
            } catch (err) {
                console.error('Error fetching site settings:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, loading, error };
};
