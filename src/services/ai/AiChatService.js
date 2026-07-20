import { AiGateway } from './AiGateway';

/**
 * Service to handle AI generation and prompt engineering for chat.
 * Integrates planning details context dynamically into the system instruction.
 */
class AiChatService {
    /**
     * Communicates with AI Gateway to generate a chat response.
     * Injecting planning context dynamically.
     * 
     * @param {string} prompt - Current user message.
     * @param {Array} history - Previous message history [{ role: 'user'|'assistant', content: string }].
     * @param {Object} [planningData] - Planning details context (date, budget, guests, etc.).
     * @param {string} [language] - Language code ('de', 'tr', 'en').
     * @returns {Promise<string>} The generated response text from AI.
     */
    async sendMessage(prompt, history = [], planningData = {}, language = 'de') {
        // Construct detailed planning context to inject as system instruction
        const weddingDate = planningData.weddingDate || 'Noch nicht festgelegt / Not set / Belirlenmedi';
        const budget = planningData.budget || 0;
        
        // Calculate remaining budget if items are provided
        let actualSpent = 0;
        if (Array.isArray(planningData.budgetItems)) {
            actualSpent = planningData.budgetItems.reduce((sum, item) => sum + (item.actual || item.estimated_cost || 0), 0);
        }
        const remainingBudget = Math.max(0, budget - actualSpent);
        const guestCount = Array.isArray(planningData.guests) ? planningData.guests.length : 0;
        
        // Tasks progress
        let completedTasks = 0;
        let totalTasks = 0;
        if (Array.isArray(planningData.tasks)) {
            totalTasks = planningData.tasks.length;
            completedTasks = planningData.tasks.filter(t => t.completed || t.is_completed).length;
        }

        // Language specific system guidelines
        let langInstruction = '';
        if (language === 'tr') {
            langInstruction = 'Yanıtlarını Türkçe olarak ver. Profesyonel, samimi ve yardımcı bir ton kullan. Düğün planlama araçlarını (bütçe, davetli listesi, oturma planı) kullanmalarını öner.';
        } else if (language === 'en') {
            langInstruction = 'Respond in English. Keep a professional, warm, and helpful tone. Suggest using our wedding planning tools (budget planner, guest list, seating chart).';
        } else {
            // Default to German
            langInstruction = 'Antworte auf Deutsch. Nutze einen professionellen, herzlichen und hilfreichen Ton. Empfiehl dem Nutzer, unsere Hochzeitsplanungswerkzeuge (Budgetplaner, Gästeliste, Tischplaner) zu verwenden.';
        }

        const systemInstruction = `
You are the official AI Wedding Planner Assistant on the KolayDüğün platform. Your name is "KolayDüğün Yapay Zekâ Asistanı" (or "AI Hochzeitsplaner").
Your goal is to guide couples in planning their dream wedding, recommending planning actions, and helping them find services.

Here is the couple's current wedding planning status:
- Wedding Date: ${weddingDate}
- Total Budget: ${budget} EUR
- Estimated Remaining Budget: ${remainingBudget} EUR
- Total Guests Invited: ${guestCount}
- Checklist Progress: ${completedTasks} completed out of ${totalTasks} tasks.

Guidelines:
1. ${langInstruction}
2. Be concise and structured. Use bullet points for recommendations if helpful.
3. If they need manual assistance or want to connect with vendor support/custom quotes, let them know they can click the WhatsApp support icon in this window at any time.
4. Keep the advice tailored to Germany/Europe wedding context.
`;

        try {
            // We pass systemInstruction in options.
            // Under the hood, AiGateway delegates to the active provider (e.g. GeminiProvider)
            const options = {
                systemInstruction,
                temperature: 0.7
            };

            const responseText = await AiGateway.generateChat(prompt, history, options);
            return responseText;
        } catch (error) {
            console.error('[AiChatService] Error during sendMessage generation:', error);
            throw error;
        }
    }
}

export const aiChatService = new AiChatService();
