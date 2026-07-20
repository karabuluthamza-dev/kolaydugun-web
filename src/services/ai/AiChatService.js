import { AiGateway } from './AiGateway';

/**
 * Service to handle AI generation and prompt engineering for chat.
 * Integrates planning details context dynamically into the system instruction.
 */
class AiChatService {
    /**
     * Communicates with AI Gateway to generate a chat response.
     * Injecting planning context dynamically and supporting tool execution callbacks.
     * 
     * @param {string} prompt - Current user message.
     * @param {Array} history - Previous message history [{ role: 'user'|'assistant', content: string }].
     * @param {Object} [planningData] - Planning details context (date, budget, guests, etc.).
     * @param {string} [language] - Language code ('de', 'tr', 'en').
     * @param {Object} [callbacks] - Local callback functions to execute tools.
     * @returns {Promise<string>} The generated response text from AI.
     */
    async sendMessage(prompt, history = [], planningData = {}, language = 'de', callbacks = {}) {
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

        // 1. Construct rich lists for model context so it knows IDs and can refer to them in tools
        let tasksContext = '';
        if (Array.isArray(planningData.tasks) && planningData.tasks.length > 0) {
            tasksContext = planningData.tasks.map(t => 
                `- ID: ${t.id} | Title: "${t.title}" | Status: ${t.completed ? 'Completed' : 'Pending'} | Category: "${t.category || 'Other'}"`
            ).join('\n');
        } else {
            tasksContext = 'No tasks in the checklist yet.';
        }

        let budgetContext = '';
        if (Array.isArray(planningData.budgetItems) && planningData.budgetItems.length > 0) {
            budgetContext = planningData.budgetItems.map(i => 
                `- ID: ${i.id} | Category: "${i.category}" | Estimated: ${i.estimated} EUR | Actual: ${i.actual} EUR | Notes: "${i.notes || ''}"`
            ).join('\n');
        } else {
            budgetContext = 'No budget items yet.';
        }

        let guestsContext = '';
        if (Array.isArray(planningData.guests) && planningData.guests.length > 0) {
            guestsContext = planningData.guests.map(g => 
                `- ID: ${g.id} | Name: "${g.name}" | Status: ${g.status || 'pending'} | Dietary: "${g.dietary_restrictions || ''}"`
            ).join('\n');
        } else {
            guestsContext = 'No guests in the guest list yet.';
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
Your goal is to guide couples in planning their dream wedding, recommending planning actions, and helping them manage their tasks, guests, and budget.

Here is the couple's current detailed wedding planning status:
- Wedding Date: ${weddingDate}
- Total Budget: ${budget} EUR
- Estimated Remaining Budget: ${remainingBudget} EUR
- Total Guests Invited: ${guestCount}
- Checklist Progress: ${completedTasks} completed out of ${totalTasks} tasks.

=== CURRENT TASKS / TODO CHECKLIST ===
${tasksContext}

=== CURRENT BUDGET ITEMS ===
${budgetContext}

=== CURRENT GUESTS ===
${guestsContext}

Guidelines:
1. ${langInstruction}
2. Be concise and structured. Use bullet points for recommendations if helpful.
3. If they need manual assistance or want to connect with vendor support/custom quotes, let them know they can click the WhatsApp support icon in this window at any time.
4. Keep the advice tailored to Germany/Europe wedding context.
5. If the user asks to add, remove, or update any task, guest, or budget item, execute the corresponding tool immediately. You MUST use the ID shown above when updating or removing an item.
`;

        try {
            const isToolUseEnabled = await AiGateway.getFeatureFlag('tool_use');
            const options = {
                systemInstruction,
                temperature: 0.7
            };

            if (isToolUseEnabled && callbacks && Object.keys(callbacks).length > 0) {
                options.tools = this.getToolsDefinition();
                options.callbacks = callbacks;
            }

            const responseText = await AiGateway.generateChat(prompt, history, options);
            return responseText;
        } catch (error) {
            console.error('[AiChatService] Error during sendMessage generation:', error);
            throw error;
        }
    }

    /**
     * Declares the tools/functions schema for Gemini provider.
     */
    getToolsDefinition() {
        return [
            {
                functionDeclarations: [
                    {
                        name: "add_guest",
                        description: "Adds a guest to the wedding guest list. Use when the user wants to invite someone or add a guest.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                name: {
                                    type: "STRING",
                                    description: "The full name of the guest."
                                }
                            },
                            required: ["name"]
                        }
                    },
                    {
                        name: "remove_guest",
                        description: "Removes a guest from the wedding guest list. Use when the user wants to remove or delete a guest. Requires guest_id.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                guest_id: {
                                    type: "STRING",
                                    description: "The unique ID of the guest to remove."
                                }
                            },
                            required: ["guest_id"]
                        }
                    },
                    {
                        name: "add_todo",
                        description: "Adds a task/todo to the wedding checklist.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                title: {
                                    type: "STRING",
                                    description: "The title of the task."
                                },
                                category: {
                                    type: "STRING",
                                    description: "The category of the task (e.g., Venue, Catering, Attire, Flowers, Music, Invitations, Other)."
                                },
                                month: {
                                    type: "STRING",
                                    description: "The timeframe/month when this should be done (e.g. '12-10 months', '9-7 months', '6-4 months', '3-2 months', '1 month', 'Wedding Day')."
                                },
                                notes: {
                                    type: "STRING",
                                    description: "Optional notes/description for the task."
                                }
                            },
                            required: ["title"]
                        }
                    },
                    {
                        name: "update_todo_status",
                        description: "Updates the completion status of a task/todo.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                todo_id: {
                                    type: "STRING",
                                    description: "The unique ID of the task to update."
                                },
                                completed: {
                                    type: "BOOLEAN",
                                    description: "True to mark the task as completed/done, False to mark it as uncompleted."
                                }
                            },
                            required: ["todo_id", "completed"]
                        }
                    },
                    {
                        name: "remove_todo",
                        description: "Removes a task/todo from the checklist.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                todo_id: {
                                    type: "STRING",
                                    description: "The unique ID of the task to remove."
                                }
                            },
                            required: ["todo_id"]
                        }
                    },
                    {
                        name: "add_budget_item",
                        description: "Adds a new estimated spending item to the budget planner.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                category: {
                                    type: "STRING",
                                    description: "The category of the budget item (e.g. venue, food, photo, dress, music, flowers, invite, cake, transport, honeymoon, other)."
                                },
                                estimated: {
                                    type: "NUMBER",
                                    description: "The estimated cost in Euros."
                                },
                                notes: {
                                    type: "STRING",
                                    description: "Optional notes or details for the item."
                                }
                            },
                            required: ["category", "estimated"]
                        }
                    },
                    {
                        name: "update_budget_item_cost",
                        description: "Updates the cost details (estimated, actual spent) or notes of a budget item.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                item_id: {
                                    type: "STRING",
                                    description: "The unique ID of the budget item."
                                },
                                estimated: {
                                    type: "NUMBER",
                                    description: "The updated estimated cost in Euros (optional)."
                                },
                                actual: {
                                    type: "NUMBER",
                                    description: "The updated actual spent amount in Euros (optional)."
                                },
                                notes: {
                                    type: "STRING",
                                    description: "The updated notes (optional)."
                                }
                            },
                            required: ["item_id"]
                        }
                    },
                    {
                        name: "remove_budget_item",
                        description: "Removes a budget item from the planner.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                item_id: {
                                    type: "STRING",
                                    description: "The unique ID of the budget item to remove."
                                }
                            },
                            required: ["item_id"]
                        }
                    },
                    {
                        name: "set_total_budget",
                        description: "Sets or updates the overall target budget for the wedding.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                amount: {
                                    type: "NUMBER",
                                    description: "The new total budget in Euros."
                                }
                            },
                            required: ["amount"]
                        }
                    }
                ]
            }
        ];
    }
}

export const aiChatService = new AiChatService();
