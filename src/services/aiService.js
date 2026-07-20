import { AiGateway } from "./ai/AiGateway";

/**
 * AI Service for intelligent data processing using the global AI Gateway.
 * Backwards compatible with legacy consumers.
 */

/**
 * Suggests the best matching city from the available list based on raw input
 */
export const suggestCity = async (rawCity, availableCities, countryHint = null, zipCode = null) => {
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

    const result = await AiGateway.generateContent(prompt);
    const text = result.replace(/^"|"$/g, '');
    return text === "null" ? null : text;
};

/**
 * Generates SEO-friendly, professional description for a vendor
 */
export const enrichVendorContent = async (vendorName, category, rawData) => {
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

    return await AiGateway.generateContent(prompt);
};

/**
 * Suggests the best matching category from our valid list based on raw input
 */
export const suggestCategory = async (rawInput, availableCategories) => {
    const prompt = `
    You are an intelligent category mapping assistant for a wedding platform.
    OBJECTIVE: Map a raw category/business description string to the MOST APPROPRIATE category from our platform.
    CRITICAL: Pick one category from the "VALID CATEGORIES LIST". No inventions.
    
    RAW INPUT: "${rawInput}"
    VALID CATEGORIES LIST: ${JSON.stringify(availableCategories)} 
    
    OUTPUT FORMAT: Return ONLY the exact category name or "null". No explanations.
    `;

    const result = await AiGateway.generateContent(prompt);
    const text = result.replace(/^"|"$/g, '');
    return text === "null" ? null : text;
};

