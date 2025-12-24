import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aggressive cleanup for malformed Supabase session
        const clearCorruptSession = async () => {
            try {
                const keys = Object.keys(localStorage);
                const supabaseKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
                if (supabaseKey) {
                    const rawData = localStorage.getItem(supabaseKey);
                    if (rawData && rawData !== 'null') {
                        const parsed = JSON.parse(rawData);
                        const token = parsed.access_token;

                        // Check if it's a valid JWT structure (header.payload.signature)
                        if (token && typeof token === 'string' && token.split('.').length !== 3) {
                            console.warn('[DEBUG] Invalid JWT format detected. Performing full session reset.');

                            // 1. Remove from localStorage immediately
                            localStorage.removeItem(supabaseKey);

                            // 2. Clear all related Supabase keys just in case
                            keys.forEach(k => {
                                if (k.includes('supabase') || k.startsWith('sb-')) {
                                    localStorage.removeItem(k);
                                }
                            });

                            // 3. Clear session and reload
                            sessionStorage.clear();
                            window.location.href = '/';
                            return true;
                        }
                    }
                }
            } catch (err) {
                console.error('[DEBUG] clearCorruptSession failed:', err);
            }
            return false;
        };

        const initAuth = async () => {
            try {
                const wasCleared = await clearCorruptSession();
                if (wasCleared) return; // Page will reload, no need to setLoading(false)

                // Check active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[DEBUG] AuthContext getSession error:', error);
                    if (error.message.includes('JWT') || error.status === 401 || error.code === 'PGRST301') {
                        await supabase.auth.signOut();
                        localStorage.clear();
                        setLoading(false); // CRITICAL: Set loading to false before reload
                        window.location.reload();
                        return;
                    }
                    // For other errors, still set loading to false
                    setLoading(false);
                    return;
                }

                if (session) {
                    fetchProfile(session.user);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('[DEBUG] initAuth unexpected error:', err);
                setLoading(false); // CRITICAL: Always set loading to false on error
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user?.id) {
                fetchProfile(session.user);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (authUser) => {
        setLoading(true);
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle();

            if (error) {
                console.error('[DEBUG] AuthContext fetchProfile database error:', error);
                throw error;
            }

            // EMERGENCY FIX: Force admin role for specific user
            if (data && (authUser.id === '13e2508f-e520-4bb3-bd3d-e1f4eee59024' || authUser.email === 'karabulut.hamza@gmail.com')) {
                data.role = 'admin';
            }

            // CHECK FOR PENDING GOOGLE ROLE
            const pendingRole = localStorage.getItem('pending_google_role');
            if (pendingRole) {
                if (pendingRole === 'vendor' && data?.role !== 'vendor') {
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ role: 'vendor' })
                        .eq('id', authUser.id);

                    if (!updateError && data) {
                        data.role = 'vendor';
                        await createVendorRecord(authUser.id, {
                            name: authUser.user_metadata?.full_name || authUser.email,
                            category: 'Other',
                            location: 'Unknown'
                        });
                    }
                }
                localStorage.removeItem('pending_google_role');
            }

            if (data) {
                if (!data.role) data.role = authUser.user_metadata?.role || 'couple';
                setUser({ ...authUser, ...data });
            } else {
                setUser({ ...authUser, role: 'couple' });
            }
        } catch (error) {
            console.error('[DEBUG] AuthContext fetchProfile catch block:', error);
            setUser({
                ...authUser,
                role: authUser.user_metadata?.role || 'couple'
            });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        if (data.user) await fetchProfile(data.user);
        return data;
    };

    const loginWithGoogle = async (role = 'couple') => {
        localStorage.setItem('pending_google_role', role);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    };

    const register = async (data, type) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    role: type,
                    full_name: data.name
                }
            }
        });

        if (authError) throw authError;

        if (authData.user && type === 'vendor') {
            await createVendorRecord(authData.user.id, data);
        }
        return authData;
    };

    const createVendorRecord = async (userId, data) => {
        try {
            await supabase.from('vendors').insert([{
                id: userId,
                business_name: data.name || 'New Vendor',
                category: data.category || 'Other',
                city: data.location || 'Unknown',
                subscription_tier: 'free',
                is_claimed: true,
                credit_balance: 10
            }]);

            await supabase.from('vendor_profiles').insert([{
                user_id: userId,
                plan_type: 'free',
                credits: 10
            }]);
        } catch (error) {
            console.error('Error in createVendorRecord:', error);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setUser(null);
            localStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
