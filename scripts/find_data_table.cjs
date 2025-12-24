const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    // Note: This might not work with anon_key due to RLS, but let's try a common RPC or just check other names
    const tableNames = ['vendor_imports', 'vendor_categories', 'vendors', 'categories', 'vendor_data', 'scraped_data'];

    for (const table of tableNames) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`Table '${table}': ${count} rows`);
        } else if (error.code !== '42P01') { // 42P01 is "relation does not exist"
            console.log(`Table '${table}': Error ${error.code} - ${error.message}`);
        }
    }
}

listTables();
