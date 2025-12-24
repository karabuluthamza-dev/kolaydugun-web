import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = 'dab4a65f-c08e-4219-9aa8-c22be8684ae9';

async function checkVendor() {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.log('Vendor not found or error:', error.message);
    } else {
        console.log('Vendor found:', data);
    }
}

checkVendor();
