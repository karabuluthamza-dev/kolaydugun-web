
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Script started');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

console.log('Supabase initialized');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('Checking favorites table...');
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .limit(1);

    if (error) {
        console.log('Error accessing favorites table:', error.message);
    } else {
        console.log('Favorites table exists. Sample data:', data);
    }
}

checkTables();
