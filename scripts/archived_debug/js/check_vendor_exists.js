
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendor() {
    const vendorId = '13e2508f-e520-4bb3-bd3d-e1f4eee59024';
    console.log(`Checking for vendor: ${vendorId}`);

    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId);

    if (error) {
        console.error('Error fetching vendor:', error);
    } else {
        if (data && data.length > 0) {
            console.log('Vendor found:', data[0]);
            console.log('Deleted At:', data[0].deleted_at);
        } else {
            console.log('Vendor NOT found in database.');
        }
    }
}

checkVendor();
