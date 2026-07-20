/* eslint-disable no-unused-vars */
/**
 * Abstract base class representing an AI service provider.
 * Defines the contract that all concrete providers (Gemini, OpenAI, Claude, etc.) must implement.
 */
export class AiAdapter {
    /**
     * Generates a chat response for a given prompt and context history.
     * @param {string} prompt - The current user prompt.
     * @param {Array} history - Optional history of messages [{ role: 'user'|'assistant'|'system', content: string }].
     * @param {Object} options - Provider-specific configurations (temperature, maxTokens, systemInstruction, etc.).
     * @returns {Promise<string>} The generated response text.
     */
    async generateChat(prompt, history = [], options = {}) {
        throw new Error('generateChat must be implemented by concrete subclass');
    }

    /**
     * Generic content generation helper (e.g., translation, categorisation, content enrichment).
     * @param {string} prompt - Prompt to submit.
     * @param {Object} options - Configuration.
     * @returns {Promise<string>} Generated output.
     */
    async generateContent(prompt, options = {}) {
        throw new Error('generateContent must be implemented by concrete subclass');
    }
}
