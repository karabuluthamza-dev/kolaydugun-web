import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TARGET_USER_ID = '2ea5fdee-da7b-4b9b-8733-3c944b7e11a4'; // Hamza Karabulut

async function inspectProfile() {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', TARGET_USER_ID)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return;
    }

    console.log('Profile:', profile);
}

inspectProfile();
