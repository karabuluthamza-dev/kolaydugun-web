import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useUnreadMessages = (userId, userRole) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const fetchUnreadCount = async () => {
            if (!userId) return;

            // Simple UUID validation to prevent 400 error on invalid IDs
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                console.warn('[useUnreadMessages] Invalid userId format, skipping fetch:', userId);
                return;
            }

            try {
                const { data, count, error } = await supabase
                    .from('messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('receiver_id', userId)
                    .is('read_at', null);

                if (error) {
                    // Only log real errors, ignore 400 if user is signed out or invalid
                    if (error.code !== 'PGRST116') {
                        console.error('Error fetching unread count:', error);
                    }
                    return;
                }

                setUnreadCount(count || 0);
            } catch (error) {
                console.error('Error in useUnreadMessages:', error);
            }
        };

        fetchUnreadCount();

        // Subscribe to real-time updates
        const channel = supabase
            .channel('unread-messages')
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
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return unreadCount;
};
