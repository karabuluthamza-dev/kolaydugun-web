/* eslint-disable no-unused-vars */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiAdapter } from "../AiAdapter";

export class GeminiProvider extends AiAdapter {
    constructor() {
        super();
        this.apiKey = localStorage.getItem('admin_gemini_api_key')?.trim() ||
            import.meta.env.VITE_GEMINI_API_KEY?.trim();
    }

    getGenAI() {
        if (!this.apiKey) {
            throw new Error("Gemini API Key missing.");
        }
        return new GoogleGenerativeAI(this.apiKey);
    }

    async getAvailableModels() {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            if (response.ok) {
                const data = await response.json();
                if (data.models) {
                    return data.models
                        .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                        .map(m => m.name.replace("models/", ""));
                }
            }
        } catch (e) {
            console.warn("[GeminiProvider] Failed to fetch models dynamically:", e);
        }
        return ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    }

    async generateContent(prompt, options = {}) {
        const genAI = this.getGenAI();
        const available = await this.getAvailableModels();

        const priorityOrder = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        let candidateModels = [];
        priorityOrder.forEach(p => {
            if (available.includes(p)) candidateModels.push(p);
        });
        available.forEach(m => {
            if (!candidateModels.includes(m)) candidateModels.push(m);
        });

        if (candidateModels.length === 0) {
            candidateModels = ["gemini-1.5-flash", "gemini-pro"];
        }

        let lastError = null;
        for (const modelName of candidateModels) {
            try {
                console.log(`🤖 [GeminiProvider] Trying: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().trim();
                if (text) return text;
            } catch (error) {
                console.warn(`⚠️ [GeminiProvider] ${modelName} fail:`, error.message);
                lastError = error;
            }
        }
        throw new Error(`Gemini generation failed. Last error: ${lastError?.message}`);
    }

    async generateChat(prompt, history = [], options = {}) {
        const genAI = this.getGenAI();
        const modelName = options.modelName || "gemini-1.5-flash";
        const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: options.systemInstruction
        });

        // Format history for Gemini API
        // Gemini expects history in roles: 'user' and 'model' (not 'assistant')
        const formattedHistory = history
            .filter(msg => msg.role !== 'system') // systemInstruction is passed separately above
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        try {
            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: {
                    temperature: options.temperature ?? 0.7,
                    maxOutputTokens: options.maxTokens ?? 2048,
                }
            });

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("[GeminiProvider] Chat generation error:", error);
            throw error;
        }
    }
}
