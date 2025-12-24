import { createClient } from '@supabase/supabase-js';

// Custom storage handler to filter out malformed JWTs and handle PGRST301
const secureStorage = {
    getItem: (key) => {
        const value = localStorage.getItem(key);
        if (key.includes('-auth-token') && value && value !== 'null') {
            try {
                const parsed = JSON.parse(value);
                const token = parsed.access_token;

                // 1. Check for structural malformation
                if (token && typeof token === 'string' && token.split('.').length !== 3) {
                    console.warn('[SUPABASE_AUTH] Malformed JWT detected in storage. Clearing.');
                    localStorage.removeItem(key);
                    return null;
                }

                // 2. We can't easily check for PGRST301 (cryptographic failure) here since it's a server response,
                // but we can ensure that if the token is clearly invalid or "null" string, we wipe it.
                if (value === 'null' || !token) {
                    localStorage.removeItem(key);
                    return null;
                }
            } catch (e) {
                localStorage.removeItem(key);
                return null;
            }
        }
        return value;
    },
    setItem: (key, value) => {
        localStorage.setItem(key, value);
    },
    removeItem: (key) => {
        localStorage.removeItem(key);
    }
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: secureStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
});



