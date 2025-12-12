import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(rootDir, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForumTables() {
    console.log('🔍 Checking if forum_settings table exists...');

    // We try to select from the table. If it exists, we get data (or empty array).
    // If it doesn't exist, we get a specific error (404-like or "relation does not exist").
    const { data, error } = await supabase
        .from('forum_settings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Check Failed:', error.message);
        if (error.message.includes('relation "public.forum_settings" does not exist')) {
            console.log('Result: Tables do NOT exist yet.');
        } else {
            console.log('Result: Database connection error or other issue.');
        }
    } else {
        console.log('✅ Success! Found forum_settings table.');
        console.log('Data:', data);
    }
}

checkForumTables();
