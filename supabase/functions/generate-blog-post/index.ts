import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Hello from Functions!");

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 🔒 SECURITY: Verify admin role
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Unauthorized - No auth token" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized - Invalid token" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            console.warn(`⚠️ SECURITY: Non-admin user ${user.id} attempted to generate blog post`);
            return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { topic, audience, tone, length, instructions } = await req.json();

        if (!OPENAI_API_KEY) {
            throw new Error("Missing OpenAI API Key");
        }

        const systemPrompt = `
      You are an expert SEO blog post writer for a wedding planning platform called "KolayDugun".
      Your task is to write a high-quality, engaging blog post in 3 languages (German, English, Turkish) based on the user's topic.
      
      The output MUST be a valid JSON object with the following structure:
      {
        "de": "<h1>Title in German</h1><p>Content in German...</p>",
        "en": "<h1>Title in English</h1><p>Content in English...</p>",
        "tr": "<h1>Title in Turkish</h1><p>Content in Turkish...</p>",
        "slots": [
          {
            "id": "SLOT_1",
            "context_summary": "Brief description of where this slot is placed and what fits here",
            "suggested_product_type": "Type of product (e.g., 'Wedding Dress', 'Candles')",
            "search_keywords": {
              "de": ["keyword1", "keyword2"],
              "en": ["keyword1", "keyword2"],
              "tr": ["keyword1", "keyword2"]
            }
          }
        ]
      }

      IMPORTANT RULES:
      1. The content must be formatted in HTML (use <h2>, <p>, <ul>, <li>).
      2. Do NOT wrap the JSON in markdown code blocks (like \`\`\`json). Return ONLY the raw JSON string.
      3. Include at least 2 affiliate slots in the content. 
      4. Place the slots naturally within the text using the placeholder format: {{SLOT_ID}}.
      5. Example usage in content: "<p>We recommend these beautiful candles: {{SLOT_1}}</p>"
      6. Ensure the tone is: ${tone}.
      7. Target audience: ${audience}.
      8. Length: ${length}.
    `;

        const userPrompt = `Write a blog post about: "${topic}". Additional instructions: ${instructions}`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o", // or gpt-3.5-turbo if preferred for cost
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiContent = data.choices[0].message.content;

        // Parse JSON safely
        let parsedContent;
        try {
            parsedContent = JSON.parse(aiContent);
        } catch (e) {
            // Fallback if AI wraps in code block
            const cleanContent = aiContent.replace(/```json\n?|```/g, "");
            parsedContent = JSON.parse(cleanContent);
        }

        return new Response(JSON.stringify(parsedContent), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
