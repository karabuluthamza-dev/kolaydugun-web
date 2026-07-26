import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const apiKey = process.env.VITE_OPENAI_API_KEY;
console.log("Testing OpenAI API Key via fetch:", apiKey ? "Loaded" : "Missing");

async function run() {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Hello!" }]
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Success:", data.choices[0].message.content);
        } else {
            console.error("OpenAI API returned error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
