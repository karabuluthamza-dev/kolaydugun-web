import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeadsTable() {
    console.log('Checking leads table structure...\n');

    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .limit(1);

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log('✅ Leads table columns:');
        console.log(Object.keys(data[0]));
    } else {
        console.log('⚠️  No leads found in table');
    }
}

checkLeadsTable();
