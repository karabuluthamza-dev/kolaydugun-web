import { AiAdapter } from "../AiAdapter";

/**
 * Mock AI Provider for local sandbox development and automated integration testing
 * without requiring real Google/OpenAI paid API keys.
 * 
 * Simulates Gemini function calling by parsing input prompts for keywords.
 */
export class MockAiProvider extends AiAdapter {
    async generateChat(prompt, history = [], options = {}) {
        console.log(`🤖 [MockAiProvider] Received prompt: "${prompt}"`);

        const systemInstruction = options.systemInstruction || "";
        let language = "de";
        if (systemInstruction.includes("Türkçe")) {
            language = "tr";
        } else if (systemInstruction.includes("English")) {
            language = "en";
        }

        const normalizedPrompt = prompt.toLowerCase().trim();

        // 1. Tool Trigger Matching: Guest Manager
        // Match Ahmet Soylu or similar names in quotes or text
        const guestAddMatch = prompt.match(/(?:ekle|davet|add|invite)\s+['"“]([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)['"”]/i) || 
                              prompt.match(/(?:ekle|davet|add|invite)\s+([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)/i) || 
                              prompt.match(/['"“]([a-zA-ZğüşıöçĞÜŞİÖÇ\s]+)['"”]\s+(?:isimli\s+)?(?:bir\s+)?(?:konuk\s+|davetli\s+)?(?:ekle|davet)/i);
        const guestRemoveMatch = prompt.match(/(?:davetli\s+sil|konuk\s+sil|davetli\s+çıkar|remove\s+guest|delete\s+guest)\s+(\S+)/i);

        // 2. Tool Trigger Matching: Todo Checklist
        const todoAddMatch = prompt.match(/(?:yapılacak|todo|görev)\s+['"“]?([a-zA-ZğüşıöçĞÜŞİÖÇ\s\d]+)['"”]?\s+(?:ekle|add)/i) || 
                             prompt.match(/(?:add|create)\s+(?:todo|task)\s+['"“]?([a-zA-ZğüşıöçĞÜŞİÖÇ\s\d]+)['"”]?/i);
        const todoStatusMatch = prompt.match(/(?:görev\s+güncelle|görevi\s+tamamla|status\s+update|complete\s+todo)\s+(\S+)\s+(\S+)/i);
        const todoRemoveMatch = prompt.match(/(?:görev\s+sil|todo\s+sil|remove\s+todo|delete\s+task)\s+(\S+)/i);

        // 3. Tool Trigger Matching: Budget
        const budgetAddMatch = prompt.match(/(?:bütçe\s+ekle|add\s+budget|bütçeye\s+ekle)\s+([a-zA-Z\s]+)\s+(\d+)/i);
        const budgetUpdateMatch = prompt.match(/(?:bütçe\s+güncelle|update\s+budget)\s+(\S+)\s+(\d+)/i);
        const budgetRemoveMatch = prompt.match(/(?:bütçe\s+sil|remove\s+budget)\s+(\S+)/i);
        const totalBudgetMatch = prompt.match(/(?:toplam\s+bütçe|set\s+budget|target\s+budget)\s+(\d+)/i);

        // --- EXECUTE MATCHED TOOLS ---
        try {
            if (options.callbacks) {
                // Add Guest
                if (guestAddMatch && typeof options.callbacks.add_guest === 'function') {
                    const guestName = guestAddMatch[1].trim();
                    console.log(`🔌 [MockAiProvider] Simulating add_guest callback: ${guestName}`);
                    const result = await options.callbacks.add_guest({ name: guestName });
                    
                    return language === "tr" 
                        ? `🎉 '${guestName}' isimli konuk davetli listenize başarıyla eklendi! (Mock AI)`
                        : language === "en"
                        ? `🎉 Guest '${guestName}' has been successfully added to your guest list! (Mock AI)`
                        : `🎉 Der Gast '${guestName}' wurde erfolgreich zu Ihrer Gästeliste hinzugefügt! (Mock AI)`;
                }

                // Remove Guest
                if (guestRemoveMatch && typeof options.callbacks.remove_guest === 'function') {
                    const guestId = guestRemoveMatch[1].trim();
                    console.log(`🔌 [MockAiProvider] Simulating remove_guest callback: ${guestId}`);
                    await options.callbacks.remove_guest({ guest_id: guestId });
                    return language === "tr"
                        ? `✅ ID'si ${guestId} olan davetli başarıyla silindi. (Mock AI)`
                        : `✅ Guest with ID ${guestId} has been removed. (Mock AI)`;
                }

                // Add Todo
                if (todoAddMatch && typeof options.callbacks.add_todo === 'function') {
                    const title = todoAddMatch[1].trim();
                    console.log(`🔌 [MockAiProvider] Simulating add_todo callback: ${title}`);
                    await options.callbacks.add_todo({ title, category: 'Other', month: '12-10 months' });
                    return language === "tr"
                        ? `📋 '${title}' görevi yapılacaklar listenize eklendi! (Mock AI)`
                        : `📋 Task '${title}' has been added to your checklist! (Mock AI)`;
                }

                // Update Todo Status
                if (todoStatusMatch && typeof options.callbacks.update_todo_status === 'function') {
                    const todoId = todoStatusMatch[1].trim();
                    const completed = todoStatusMatch[2].trim() === "true" || todoStatusMatch[2].trim() === "tamam";
                    console.log(`🔌 [MockAiProvider] Simulating update_todo_status callback: ID=${todoId}, completed=${completed}`);
                    await options.callbacks.update_todo_status({ todo_id: todoId, completed });
                    return language === "tr"
                        ? `✅ Görev durumu güncellendi (Tamamlandı = ${completed ? "Evet" : "Hayır"}). (Mock AI)`
                        : `✅ Task status updated (Completed = ${completed}). (Mock AI)`;
                }

                // Remove Todo
                if (todoRemoveMatch && typeof options.callbacks.remove_todo === 'function') {
                    const todoId = todoRemoveMatch[1].trim();
                    console.log(`🔌 [MockAiProvider] Simulating remove_todo callback: ${todoId}`);
                    await options.callbacks.remove_todo({ todo_id: todoId });
                    return language === "tr"
                        ? `✅ '${todoId}' ID'li görev silindi. (Mock AI)`
                        : `✅ Task with ID ${todoId} has been removed. (Mock AI)`;
                }

                // Set Total Budget
                if (totalBudgetMatch && typeof options.callbacks.set_total_budget === 'function') {
                    const amount = Number(totalBudgetMatch[1]);
                    console.log(`🔌 [MockAiProvider] Simulating set_total_budget callback: ${amount}`);
                    await options.callbacks.set_total_budget({ amount });
                    return language === "tr"
                        ? `💰 Toplam bütçe hedefiniz ${amount} EUR olarak güncellendi! (Mock AI)`
                        : `💰 Your total target budget has been set to ${amount} EUR! (Mock AI)`;
                }

                // Add Budget Item
                if (budgetAddMatch && typeof options.callbacks.add_budget_item === 'function') {
                    const category = budgetAddMatch[1].trim();
                    const estimated = Number(budgetAddMatch[2]);
                    console.log(`🔌 [MockAiProvider] Simulating add_budget_item callback: ${category}, ${estimated}`);
                    await options.callbacks.add_budget_item({ category, estimated });
                    return language === "tr"
                        ? `💸 Bütçenize ${estimated} EUR tahmini maliyetle '${category}' kalemi eklendi. (Mock AI)`
                        : `💸 Added budget item '${category}' with estimated cost of ${estimated} EUR. (Mock AI)`;
                }
            }
        } catch (callbackErr) {
            console.error("❌ [MockAiProvider] Error executing mock callback:", callbackErr);
            return language === "tr"
                ? `⚠️ İşlem gerçekleştirilirken bir hata oluştu: ${callbackErr.message}`
                : `⚠️ An error occurred while executing the operation: ${callbackErr.message}`;
        }

        // --- FALLBACK GENERAL CHAT RESPONSES ---
        await new Promise(r => setTimeout(r, 1000)); // Simulate thinking latency

        if (language === "tr") {
            return `Merhaba! Ben KolayDüğün Yapay Zekâ Asistanıyım. Düğün bütçenizi, davetli listenizi veya yapılacaklar listenizi düzenlemek için bana talimatlar verebilirsiniz.
Örnek olarak şunları yazabilirsiniz:
- "Davetli listeme Ahmet Soylu'yu ekle"
- "Yapılacaklar listesine Gelinlik Seçimi ekle"
- "Toplam bütçeyi 15000 yap"`;
        } else if (language === "en") {
            return `Hello! I am your AI Wedding Planner. I can help you manage your budget, guest list, and checklist tasks.
You can ask me to:
- "Add guest Jane Doe"
- "Add todo Buy flowers"
- "Set total budget to 20000"`;
        } else {
            return `Hallo! Ich bin Ihr KI-Hochzeitsplaner. Ich kann Ihnen helfen, Ihr Budget, Ihre Gästeliste und Ihre Checkliste zu verwalten.
Sie können mich bitten:
- "Gast Max Mustermann hinzufügen"
- "Aufgabe Ringe kaufen hinzufügen"
- "Gesamtbudget auf 25000 setzen"`;
        }
    }

    async generateContent(prompt, options = {}) {
        return `Simulated Content for prompt: ${prompt}`;
    }
}
