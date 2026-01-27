import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useSessionTracking = () => {
    const { user } = useAuth();
    const location = useLocation();
    const sessionIdRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    // Start session on login
    useEffect(() => {
        if (!user) {
            sessionIdRef.current = null;
            return;
        }

        const startSession = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_sessions')
                    .insert([{
                        user_id: user.id,
                        user_agent: navigator.userAgent,
                        ip_address: null // IP is usually handled by backend/Supabase
                    }])
                    .select()
                    .single();

                if (error) throw error;
                sessionIdRef.current = data.id;
            } catch (error) {
                console.error('Error starting session:', error);
            }
        };

        if (!sessionIdRef.current) {
            startSession();
        }

        // Cleanup: End session on unmount (logout/close)
        return () => {
            if (sessionIdRef.current) {
                supabase
                    .from('user_sessions')
                    .update({ session_end: new Date().toISOString() })
                    .eq('id', sessionIdRef.current)
                    .then(({ error }) => {
                        if (error) console.error('Error ending session:', error);
                    });
            }
        };
    }, [user]);

    // Track page views
    useEffect(() => {
        if (!user || !sessionIdRef.current) return;

        const trackPageView = async () => {
            try {
                await supabase
                    .from('page_views')
                    .insert([{
                        session_id: sessionIdRef.current,
                        user_id: user.id,
                        page_path: location.pathname,
                        page_title: document.title
                    }]);
            } catch (error) {
                console.error('Error tracking page view:', error);
            }
        };

        trackPageView();
    }, [location, user]);

    // Update last activity
    useEffect(() => {
        if (!user) return;

        const updateActivity = async () => {
            if (!sessionIdRef.current) return;

            // Only update if 120 seconds passed (more efficient)
            if (Date.now() - lastActivityRef.current < 120000) return;

            try {
                await supabase
                    .from('user_sessions')
                    .update({ last_activity: new Date().toISOString() })
                    .eq('id', sessionIdRef.current);

                lastActivityRef.current = Date.now();
            } catch (error) {
                // Silently handle session update errors to avoid UI console spray
            }
        };

        const interval = setInterval(updateActivity, 120000);

        // Also update on user interaction events with heavy debounce
        const handleInteraction = () => {
            if (Date.now() - lastActivityRef.current > 60000) {
                updateActivity();
            }
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keypress', handleInteraction);

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keypress', handleInteraction);
        };
    }, [user]);
};
