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

async function inspectVendors() {
    const { data: vendors, error } = await supabase
        .from('vendors')
        .select('id, business_name, subscription_tier');

    if (error) {
        console.error('Error fetching vendors:', error);
        return;
    }

    console.log('Vendors:', vendors);
}

inspectVendors();
