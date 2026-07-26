import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_OPENAI_API_KEY;
console.log("Testing OpenAI API Key:", apiKey ? "Loaded (length: " + apiKey.length + ")" : "Missing");

if (!apiKey) {
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function run() {
    try {
        const result = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello!" }]
        });
        console.log("Success:", result.choices[0].message.content);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
