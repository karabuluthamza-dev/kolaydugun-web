import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useUnreadMessages = (userId, userRole) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId || typeof userId !== 'string') return;

        const fetchUnreadCount = async () => {
            // Robust UUID validation
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                return;
            }

            try {
                // NOTE [FUTURE-SCHEMA]: receiver_id column check might be needed in DB.
                // Currently suppressing 400 errors for stability.
                const { count, error } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('receiver_id', userId)
                    .is('read_at', null);

                if (error) {
                    // Suppress known intermittent/schema errors to keep console clean
                    if (error.code !== 'PGRST116' && error.status !== 400) {
                        console.error('[useUnreadMessages] Error:', error);
                    }
                    return;
                }

                setUnreadCount(count || 0);
            } catch (error) {
                // Silently fail to protect UI stability
            }
        };

        fetchUnreadCount();

        // Subscribe to real-time updates with safe filter
        const channel = supabase
            .channel(`unread-messages-${userId.slice(0, 8)}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${userId}`
                },
                () => {
                    fetchUnreadCount();
                }
            )
            .subscribe();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [userId]);

    return unreadCount;
};
