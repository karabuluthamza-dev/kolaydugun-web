/* eslint-disable no-unused-vars */
import { AiAdapter } from "../AiAdapter";

/**
 * OpenAI Provider adapter placeholder.
 * Not active in Phase 1; can be configured and enabled in future phases.
 */
export class OpenAiProvider extends AiAdapter {
    async generateChat(prompt, history = [], options = {}) {
        throw new Error("OpenAI Provider is not active in the current phase.");
    }

    async generateContent(prompt, options = {}) {
        throw new Error("OpenAI Provider is not active in the current phase.");
    }
}
