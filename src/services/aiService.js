import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Service for intelligent data processing using Google Gemini
 */

// Get API Key from various sources
const getApiKey = () => {
    return localStorage.getItem('admin_gemini_api_key')?.trim() ||
        import.meta.env.VITE_GEMINI_API_KEY?.trim();
};

/**
 * Shared helper to attempt generation across multiple models
 */
const generateWithFallback = async (prompt, genAI) => {
    let candidateModels = [];

    // 1. Fetch available models dynamically
    try {
        const apiKey = getApiKey();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (response.ok) {
            const data = await response.json();
            if (data.models) {
                const allModels = data.models
                    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                    .map(m => m.name.replace("models/", ""));

                const priorityOrder = [
                    "gemini-1.5-flash",
                    "gemini-1.5-flash-001",
                    "gemini-1.5-flash-8b",
                    "gemini-2.0-flash-exp",
                    "gemini-1.5-pro",
                    "gemini-pro",
                    "gemini-1.0-pro"
                ];

                priorityOrder.forEach(pModel => {
                    if (allModels.includes(pModel)) candidateModels.push(pModel);
                });
                allModels.forEach(model => {
                    if (!candidateModels.includes(model)) candidateModels.push(model);
                });
            }
        }
    } catch (e) {
        console.warn("AI Service fallback to defaults:", e);
    }

    if (candidateModels.length === 0) {
        candidateModels = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    }

    let lastError = null;
    for (const modelName of candidateModels) {
        try {
            console.log(`🤖 AI Trying: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            if (text) return text;
        } catch (error) {
            console.warn(`⚠️ ${modelName} fail:`, error.message);
            lastError = error;
        }
    }

    throw new Error(`AI generation failed after ${candidateModels.length} attempts. Last error: ${lastError?.message}`);
};

/**
 * Suggests the best matching city from the available list based on raw input
 */
/**
 * Suggests the best matching city from the available list based on raw input
 */
export const suggestCity = async (rawCity, availableCities, countryHint = null, zipCode = null) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const context = countryHint ? `Context: Country is ${countryHint}.` : '';
    const zipContext = zipCode ? `ZIP Code: ${zipCode}.` : '';

    const prompt = `
    You are an intelligent geographical mapping assistant.
    OBJECTIVE: Map a raw location string to the GEOGRAPHICALLY CLOSEST city in our "VALID CITIES LIST".
    
    INPUT: "${rawCity}"
    ${context} ${zipContext}
    
    VALID CITIES LIST: ${JSON.stringify(availableCities)} 
    
    INSTRUCTIONS:
    1. If exact match exists, return it.
    2. If no exact match, find the NEAREST city from the list (driving distance).
    3. If raw city is a small town (e.g. "Pressbaum"), map it to the nearest MAJOR city in the list (e.g. "Wien").
    4. Pay attention to Country Context! (e.g. if Country is AT, do not map to a German city).
    5. Return ONLY the exact city name from the list or "null". No explanations.
    `;

    const result = await generateWithFallback(prompt, genAI);
    const text = result.replace(/^"|"$/g, '');
    return text === "null" ? null : text;
};

/**
 * Generates SEO-friendly, professional description for a vendor
 */
export const enrichVendorContent = async (vendorName, category, rawData) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `
        You are a professional copywriter for the German wedding industry.
        Write a short, attractive, SEO-friendly description (approx. 50-80 words) for a wedding vendor.
        
        Category: ${category}
        Business Name: ${vendorName}
        Location/Data: ${JSON.stringify(rawData)}

        Rules:
        1. Language: German (Professional & inviting).
        2. Tone: Trustworthy, elegant, helpful.
        3. No inventions of phone/address not in data.
        4. Return ONLY the text, no quotes or explanations.
    `;

    return await generateWithFallback(prompt, genAI);
};

/**
 * Suggests the best matching category from our valid list based on raw input
 */
export const suggestCategory = async (rawInput, availableCategories) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Gemini API Key missing.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = `
    You are an intelligent category mapping assistant for a wedding platform.
    OBJECTIVE: Map a raw category/business description string to the MOST APPROPRIATE category from our platform.
    CRITICAL: Pick one category from the "VALID CATEGORIES LIST". No inventions.
    
    RAW INPUT: "${rawInput}"
    VALID CATEGORIES LIST: ${JSON.stringify(availableCategories)} 
    
    OUTPUT FORMAT: Return ONLY the exact category name or "null". No explanations.
    `;

    const result = await generateWithFallback(prompt, genAI);
    const text = result.replace(/^"|"$/g, '');
    return text === "null" ? null : text;
};
