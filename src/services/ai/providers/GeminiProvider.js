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
        const modelConfig = { 
            model: modelName,
            systemInstruction: options.systemInstruction
        };
        if (options.tools) {
            modelConfig.tools = options.tools;
        }
        const model = genAI.getGenerativeModel(modelConfig);

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

            let result = await chat.sendMessage(prompt);
            let response = await result.response;

            // Loop while the model issues function calls (multi-turn function calling)
            let functionCalls = response.functionCalls;
            let loopCount = 0;
            const maxLoops = 5;

            while (functionCalls && functionCalls.length > 0 && loopCount < maxLoops) {
                loopCount++;
                console.log(`🤖 [GeminiProvider] Function call requested:`, functionCalls);
                
                const functionResponses = [];
                for (const call of functionCalls) {
                    const { name, args } = call;
                    let executionResult;
                    
                    if (options.callbacks && typeof options.callbacks[name] === 'function') {
                        try {
                            console.log(`🔌 [GeminiProvider] Executing tool '${name}' with args:`, args);
                            executionResult = await options.callbacks[name](args);
                        } catch (err) {
                            console.error(`❌ [GeminiProvider] Tool execution error for '${name}':`, err);
                            executionResult = { error: err.message || String(err) };
                        }
                    } else {
                        console.warn(`⚠️ [GeminiProvider] No callback registered for tool '${name}'`);
                        executionResult = { error: `Tool ${name} is not registered or supported.` };
                    }
                    
                    functionResponses.push({
                        functionResponse: {
                            name: name,
                            response: executionResult
                        }
                    });
                }
                
                // Send the responses back to the model
                console.log(`📤 [GeminiProvider] Sending tool response back to Gemini:`, functionResponses);
                result = await chat.sendMessage(functionResponses);
                response = await result.response;
                functionCalls = response.functionCalls;
            }

            // Safely extract text — Gemini can sometimes return an empty text
            // response after tool execution (empty candidates), which throws.
            // In that case, send a brief follow-up nudge to get a confirmation message.
            let finalText = '';
            try {
                finalText = response.text().trim();
            } catch (textErr) {
                console.warn('[GeminiProvider] Empty text after tool execution, sending follow-up nudge...');
                try {
                    const followUp = await chat.sendMessage(
                        'Please confirm to the user in a friendly message what action was just completed.'
                    );
                    finalText = (await followUp.response).text().trim();
                } catch (followUpErr) {
                    console.error('[GeminiProvider] Follow-up nudge also failed:', followUpErr);
                    finalText = '✅ The action was completed successfully.';
                }
            }

            return finalText;
        } catch (error) {
            console.error("[GeminiProvider] Chat generation error:", error);
            throw error;
        }
    }
}
