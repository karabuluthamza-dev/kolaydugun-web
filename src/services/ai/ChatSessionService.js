import { supabase } from '../../lib/supabase';

/**
 * Service to manage AI chat sessions and messages in the database.
 * Abstracts all database operations away from the UI.
 */
class ChatSessionService {
    /**
     * Fetches all chat sessions for a given user.
     * @param {string} userId - ID of the logged-in user.
     * @returns {Promise<Array>} List of chat sessions.
     */
    async fetchSessions(userId) {
        if (!userId) throw new Error('[ChatSessionService] User ID is required.');
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ChatSessionService] fetchSessions error:', error.message);
            throw error;
        }
        return data || [];
    }

    /**
     * Creates a new chat session.
     * @param {string} userId - ID of the logged-in user.
     * @param {string} [title] - Optional title for the session.
     * @returns {Promise<Object>} The created session object.
     */
    async createSession(userId, title = 'Neue Konversation') {
        if (!userId) throw new Error('[ChatSessionService] User ID is required.');
        const { data, error } = await supabase
            .from('ai_chat_sessions')
            .insert([{ user_id: userId, title }])
            .select()
            .single();

        if (error) {
            console.error('[ChatSessionService] createSession error:', error.message);
            throw error;
        }
        return data;
    }

    /**
     * Deletes a chat session (cascades to messages).
     * @param {string} sessionId - ID of the session to delete.
     * @returns {Promise<boolean>} True if delete was successful.
     */
    async deleteSession(sessionId) {
        if (!sessionId) throw new Error('[ChatSessionService] Session ID is required.');
        const { error } = await supabase
            .from('ai_chat_sessions')
            .delete()
            .eq('id', sessionId);

        if (error) {
            console.error('[ChatSessionService] deleteSession error:', error.message);
            throw error;
        }
        return true;
    }

    /**
     * Fetches all messages for a given session.
     * @param {string} sessionId - ID of the chat session.
     * @returns {Promise<Array>} List of messages.
     */
    async fetchMessages(sessionId) {
        if (!sessionId) throw new Error('[ChatSessionService] Session ID is required.');
        const { data, error } = await supabase
            .from('ai_chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[ChatSessionService] fetchMessages error:', error.message);
            throw error;
        }
        return data || [];
    }

    /**
     * Saves a message to the database.
     * If the message has an ID, it updates it (e.g. status changes).
     * Otherwise, it inserts a new message.
     * 
     * @param {Object} message - The message object to save.
     * @param {string} message.session_id - Session ID.
     * @param {string} message.role - 'user' | 'assistant' | 'system'.
     * @param {string} message.content - Text content.
     * @param {Object} [message.metadata] - JSON metadata (e.g., status, planning context).
     * @param {string} [message.id] - Optional ID for updating existing message.
     * @returns {Promise<Object>} Saved message.
     */
    async saveMessage(message) {
        const { id, session_id, role, content, metadata } = message;

        if (id) {
            // Update existing message (e.g. update status from sending to sent or failed)
            const { data, error } = await supabase
                .from('ai_chat_messages')
                .update({ content, metadata: metadata || {} })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[ChatSessionService] updateMessage error:', error.message);
                throw error;
            }
            return data;
        } else {
            // Insert new message
            const { data, error } = await supabase
                .from('ai_chat_messages')
                .insert([{
                    session_id,
                    role,
                    content,
                    metadata: metadata || {}
                }])
                .select()
                .single();

            if (error) {
                console.error('[ChatSessionService] insertMessage error:', error.message);
                throw error;
            }
            return data;
        }
    }
}

export const chatSessionService = new ChatSessionService();
