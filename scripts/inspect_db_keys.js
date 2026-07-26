import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error("Missing supabase URL or service key in env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function inspect() {
    try {
        console.log("=== marketplace_config ===");
        const { data: marketplace, error: e1 } = await supabase.from("marketplace_config").select("*");
        if (e1) console.error("Error reading marketplace_config:", e1.message);
        else console.log(JSON.stringify(marketplace, null, 2));

        console.log("\n=== Checking other tables for potential API keys ===");
        // Let's check if there are other keys
    } catch (err) {
        console.error(err);
    }
}

inspect();
