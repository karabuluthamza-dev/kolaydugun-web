import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log("Checking tables...");
    
    // Check ai_chat_sessions
    const { data: sessionData, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .limit(1);
    
    if (sessionError) {
        console.error("Error fetching ai_chat_sessions:", sessionError.message);
    } else {
        console.log("ai_chat_sessions table exists!");
    }

    // Check ai_chat_messages
    const { data: msgData, error: msgError } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .limit(1);
    
    if (msgError) {
        console.error("Error fetching ai_chat_messages:", msgError.message);
    } else {
        console.log("ai_chat_messages table exists!");
    }

    // Check marketplace_config keys
    const { data: configData, error: configError } = await supabase
        .from('marketplace_config')
        .select('key, value')
        .eq('key', 'ai_features')
        .maybeSingle();

    if (configError) {
        console.error("Error fetching marketplace_config:", configError.message);
    } else {
        console.log("ai_features config in marketplace_config:", configData);
    }
}

checkTables();
